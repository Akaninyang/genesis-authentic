#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;
pub mod weights;
pub use weights::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{
        pallet_prelude::*,
        traits::ExistenceRequirement,
        BoundedVec, PalletId,
    };

    use frame_support::traits::Currency as NativeCurrency;

	use frame_system::RawOrigin;
	//use frame_support::pallet_prelude::*;
	use sp_runtime::traits::{StaticLookup, Convert};

    use frame_system::pallet_prelude::*;
    use scale_info::TypeInfo;
    use sp_runtime::traits::AccountIdConversion;
    //use sp_std::vec::Vec;

    use crate::WeightInfo as TrxWeights;

    const STORAGE_VERSION: StorageVersion = StorageVersion::new(2);

    //A stable pallet account ID used to hold NFTs during escrow.
    const PALLET_ID_BYTES: &[u8; 8] = b"mkt/escp";
    fn pallet_account<T: Config>() -> T::AccountId {
        PalletId(*PALLET_ID_BYTES).into_account_truncating()
    }

    type BalanceOf<T> =
        <<T as Config>::NativeCurrency as NativeCurrency<<T as frame_system::Config>::AccountId>>::Balance;

    // Product structure storing both marketplace product id and the actual NFT item id.
    #[derive(Clone, Encode, Decode, PartialEq, TypeInfo, RuntimeDebug, MaxEncodedLen)]
    pub struct Product<AccountId, Balance, ItemId> {
        pub id: u32,
        pub item: ItemId,
        pub name: BoundedVec<u8, ConstU32<64>>,
        pub price: Balance,
        pub owner: AccountId,
        pub genesis_owner: AccountId, // the manufacturer, immutable
        pub metadata: BoundedVec<u8, ConstU32<256>>,
        pub on_sale: bool,
        pub is_redeemed: bool,
        pub holders_count: u64,
    }
    /// The pallet configuration trait.
    /// Note: we require pallet_uniques::Config so we can reuse the runtime's
    /// CollectionId and ItemId associated types in a type-safe manner.
    #[pallet::config]
    pub trait Config: frame_system::Config + pallet_uniques::Config {
        /// The overarching event type.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        /// Weight info for extrinsics
        type TrxWeights: TrxWeights;

        /// Currency used for payments
        //type Currency: frame_support::traits::Currency<Self::AccountId>;//T::NativeCurrency
        type NativeCurrency: frame_support::traits::Currency<Self::AccountId>;

        /// Maximum number of products.
        #[pallet::constant]
        type MaxProducts: Get<u32>;

        #[pallet::constant]
        type MarketplaceCollectionId: Get<<Self as pallet_uniques::Config>::CollectionId>;

        //Initial NFT minting ID
        // #[pallet::constant]
        // type MarketplaceStartingItemId: Get<<Self as pallet_uniques::Config>::ItemId>;

        type ItemIdConverter: Convert<u32, <Self as pallet_uniques::Config>::ItemId>;
    }

    // Storage: map our u32 product id to product struct.
    #[pallet::storage]
    #[pallet::getter(fn products)]
    pub(super) type Products<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        u32,
        Product<T::AccountId, BalanceOf<T>, <T as pallet_uniques::Config>::ItemId>,
        OptionQuery,
    >;

    //Storage: for verified manuafacturers
    #[pallet::storage]
    #[pallet::getter(fn registered_manufacturers)]
    pub(super) type RegisteredManufacturers<T: Config> =
        StorageMap<_, Blake2_128Concat, T::AccountId, bool, ValueQuery>;

    // Next product id (u32).
    #[pallet::storage]
    #[pallet::getter(fn next_product_id)]
    pub(super) type NextProductId<T: Config> = StorageValue<_, u32, ValueQuery>;

    //Admin account storage
    #[pallet::storage]
    #[pallet::getter(fn admin_account)]
    pub type AdminAccount<T: Config> = StorageValue<_, T::AccountId>;

    // Events
    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        ProductListed(u32, <T as pallet_uniques::Config>::ItemId, T::AccountId, BalanceOf<T>),
        ProductPurchased(u32, <T as pallet_uniques::Config>::ItemId, T::AccountId, BalanceOf<T>, u64),
        ProductRedeemed(u32, <T as pallet_uniques::Config>::ItemId, T::AccountId),
        ProductTransferred(u32, <T as pallet_uniques::Config>::ItemId, T::AccountId, T::AccountId),
        ManufacturerRegistered(T::AccountId),
        SaleToggled(u32, T::AccountId, bool),
        ManufacturerUnregistered(T::AccountId),
        AdminSet(T::AccountId),
    }

    // Errors
    #[pallet::error]
    pub enum Error<T> {
        ProductNotFound,
        ProductAlreadySold,
        NotManufacturer,
        ProductNotForSale,
        AlreadyOwner,
        InsufficientBalance,
        Overflow,
        NotOwner,
        AlreadyRedeemed,
        CollectionCreateFailed,
        MintFailed,
        TransferFailed,
        BurnFailed,
        NotAuthorized,
        ManufacturerAlreadyRegistered,
        ManufacturerNotFound,
    }

    #[pallet::pallet]
    #[pallet::storage_version(STORAGE_VERSION)]
    pub struct Pallet<T>(_);

    // Helper: ensure collection exists. If not, create it with the pallet as owner.
    fn ensure_collection_exists<T: Config>(
        collection: <T as pallet_uniques::Config>::CollectionId,
    ) -> Result<(), DispatchError> {
        // If owner returns None, collection likely doesn't exist.
        let maybe_owner =
            pallet_uniques::Pallet::<T>::collection_owner(collection.clone());
        if maybe_owner.is_some() {
            return Ok(());
        }
		
        // Try to create with the pallet account as owner.
        let owner = pallet_account::<T>();
        use frame_system::RawOrigin;

		let origin = RawOrigin::Signed(owner.clone()).into();
		let dest = T::Lookup::unlookup(owner.clone());
		pallet_uniques::Pallet::<T>::create(
			origin,
			collection.clone(),
			dest, // admin
		)
		.map_err(|_| Error::<T>::CollectionCreateFailed)?;
        Ok(())
    }

    #[pallet::call ]
    impl<T: Config> Pallet<T> {
        /// List a product (auto-creates collection if missing), mints NFT and stores product metadata.
        #[pallet::call_index(0)]
        #[pallet::weight(T::TrxWeights::list_product())]
        pub fn list_product(
            origin: OriginFor<T>,
            name: BoundedVec<u8, ConstU32<64>>,
            metadata: BoundedVec<u8, ConstU32<256>>,
            price: BalanceOf<T>,
        ) -> DispatchResult{
            let who = ensure_signed(origin)?;
            //Only verified manufacturers
            ensure!(RegisteredManufacturers::<T>::contains_key(&who), Error::<T>::NotManufacturer);
            // product id bookkeeping
            let product_id = Self::next_product_id();
            //Prevents overflow
            ensure!(product_id < T::MaxProducts::get(), Error::<T>::Overflow);

            let bounded_name: BoundedVec<u8, _> =
                name.try_into().map_err(|_| Error::<T>::Overflow)?;
            let bounded_meta: BoundedVec<u8, _> =
                metadata.try_into().map_err(|_| Error::<T>::Overflow)?;
            // Determine collection and item id
            let collection: <T as pallet_uniques::Config>::CollectionId = T::MarketplaceCollectionId::get();
            // Ensure collection exists (create if missing)
            ensure_collection_exists::<T>(collection.clone())?;
            // Generate an ItemId from the product id. 
            let item_id: <T as pallet_uniques::Config>::ItemId = T::ItemIdConverter::convert(product_id);
            // Mint the NFT into the seller's account. Uses pallet_uniques API.
            // mint functions - adapt if needed.
            let pallet_acc = pallet_account::<T>();
            let origin = RawOrigin::Signed(pallet_acc.clone()).into();
            let owner_lookup = T::Lookup::unlookup(who.clone());
			pallet_uniques::Pallet::<T>::mint(
				origin,
				collection,
				item_id,
				owner_lookup,
			)
			.map_err(|_| Error::<T>::MintFailed)?;

            // Build product struct and store
            let product = Product::<T::AccountId, BalanceOf<T>, _> {
                id: product_id,
                item: item_id.clone(),
                name: bounded_name,
                price,
                owner: who.clone(),
                genesis_owner: who.clone(),
                metadata: bounded_meta,
                on_sale: true,
                is_redeemed: false,
                holders_count: 0,
            };

            Products::<T>::insert(product_id, product);
            NextProductId::<T>::put(product_id + 1);

            Self::deposit_event(Event::ProductListed(product_id, item_id, who, price));
            Ok(())
        }

        /// Buyer purchases a product directly (no escrow): transfer native balance -> seller then transfer NFT -> buyer.
        /// Note: we also implement an escrow flow below; this extrinsic is a convenience/all-in-one purchase.
        #[pallet::call_index(1)]
        #[pallet::weight(T::TrxWeights::buy_product())]
        pub fn buy_product(origin: OriginFor<T>, product_id: u32) -> DispatchResult {
            let buyer = ensure_signed(origin)?;
            let mut product =
                Products::<T>::get(product_id).ok_or(Error::<T>::ProductNotFound)?;

            ensure!(product.on_sale, Error::<T>::ProductNotForSale);
            ensure!(product.owner != buyer, Error::<T>::AlreadyOwner);

            let owner =  product.owner.clone();

            // payment transfer T::Currency
            T::NativeCurrency::transfer(
                &buyer,
                &product.owner,
                product.price,
                ExistenceRequirement::KeepAlive,
            )
            .map_err(|_| Error::<T>::InsufficientBalance)?;

            // transfer NFT ownership: the pallet_uniques transfer function signature varies by version
            // Typical: pallet_uniques::Pallet::<T>::transfer(origin, collection, item, dest)
            let collection: <T as pallet_uniques::Config>::CollectionId = T::MarketplaceCollectionId::get();
			let dest = T::Lookup::unlookup(buyer.clone());
            let origin = RawOrigin::Signed(owner.clone().into());
            pallet_uniques::Pallet::<T>::transfer(
                origin.into(),
                collection.clone(),
                product.item.clone(),
                dest,
            )
            .map_err(|_| Error::<T>::TransferFailed)?;

            product.on_sale = false;
            product.holders_count = product.holders_count.saturating_add(1);
            product.owner = buyer.clone();
            Products::<T>::insert(product_id, product.clone());

            Self::deposit_event(Event::ProductPurchased(product_id, product.item.clone(), buyer, product.price, product.holders_count));
            Ok(())
        }

        //Register trusted manufacturers. They alone can list fresh products for sale.
        #[pallet::call_index(2)]
        #[pallet::weight(T::TrxWeights::register_manufacturer())]
        pub fn register_manufacturer(
            origin: OriginFor<T>,
            manufacturer: T::AccountId,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            // Ensure that only the admin can call this
            ensure!(Some(who.clone()) == Self::admin_account(), Error::<T>::NotAuthorized);
            ensure!(!RegisteredManufacturers::<T>::contains_key(&manufacturer), Error::<T>::ManufacturerAlreadyRegistered);

            RegisteredManufacturers::<T>::insert(&manufacturer, true);
            Self::deposit_event(Event::ManufacturerRegistered(manufacturer));
            Ok(())
        }

        //Extrinsic for allowing the user to list their owned nft for sell
        #[pallet::call_index(3)]
        #[pallet::weight(T::TrxWeights::toggle_sale())]
        pub fn toggle_sale(origin: OriginFor<T>, product_id: u32, for_sale: bool) -> DispatchResult {
            let who = ensure_signed(origin)?;

            Products::<T>::try_mutate(product_id, |maybe_product| -> DispatchResult {
                let product = maybe_product.as_mut().ok_or(Error::<T>::ProductNotFound)?;
                ensure!(product.owner == who, Error::<T>::NotOwner);

                product.on_sale = for_sale;
                let status = product.on_sale;

                Self::deposit_event(Event::SaleToggled(product_id, who, status));
                Ok(())
            })
        }
        
        /// Redeem a product (burn the NFT) — only owner can redeem.
        #[pallet::call_index(4)]
        #[pallet::weight(T::TrxWeights::redeem_product())]
        pub fn redeem_product(origin: OriginFor<T>, product_id: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let mut product = Products::<T>::get(product_id).ok_or(Error::<T>::ProductNotFound)?;

            // check owner
            let collection: <T as pallet_uniques::Config>::CollectionId = T::MarketplaceCollectionId::get();
            let owner = pallet_uniques::Pallet::<T>::owner(collection.clone(), product.item.clone())
                .ok_or(Error::<T>::NotOwner)?;
            ensure!(owner == who, Error::<T>::NotOwner);

            ensure!(!product.is_redeemed, Error::<T>::AlreadyRedeemed);

            // burn NFT (some versions require origin and account)
            let origin = frame_system::RawOrigin::Signed(who.clone()).into();
			let lookup = T::Lookup::unlookup(who.clone());
			pallet_uniques::Pallet::<T>::burn(origin, collection.clone(), product.item.clone(), Some(lookup))
				.map_err(|_| Error::<T>::BurnFailed)?;

            product.is_redeemed = true;
            Products::<T>::insert(product_id, product.clone());

            Self::deposit_event(Event::ProductRedeemed(product_id, product.item.clone(), who));
            Ok(())
        }
        //To remove a bad manufacturer
        #[pallet::call_index(5)]
        #[pallet::weight(T::TrxWeights::unregister_manufacturer())]
        pub fn unregister_manufacturer(
            origin: OriginFor<T>,
            manufacturer: T::AccountId ) -> DispatchResult {
            // Only the admin can unregister a manufacturer
            let who = ensure_signed(origin)?;
            ensure!(Some(who.clone()) == Self::admin_account(), Error::<T>::NotAuthorized);

            // Check that manufacturer exists
            ensure!(
                RegisteredManufacturers::<T>::contains_key(&manufacturer),
                Error::<T>::ManufacturerNotFound
            );

            // Remove the manufacturer from storage
            RegisteredManufacturers::<T>::remove(&manufacturer);

            // Emit an event for tracking
            Self::deposit_event(Event::ManufacturerUnregistered(manufacturer));

            Ok(())
        }

        //Setting admin account...this will change to a community driven admin later
        #[pallet::call_index(6)]
        #[pallet::weight(T::TrxWeights::set_admin())]
        pub fn set_admin(origin: OriginFor<T>, new_admin: T::AccountId) -> DispatchResult {
            let who = ensure_signed(origin)?;
            if <AdminAccount<T>>::exists() {
                ensure!(Some(who.clone()) == Self::admin_account(), Error::<T>::NotAuthorized);
            }
            <AdminAccount<T>>::put(new_admin.clone());
            Self::deposit_event(Event::AdminSet(new_admin));
            Ok(())
        }
        
    }

    // Optional: genesis helper to create collection 0 automatically if you include build logic in runtime.
    // For now we create the collection on-demand in ensure_collection_exists.
}