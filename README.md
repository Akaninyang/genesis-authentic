# **Genesis Authentic Marketplace 🚀  **
Tagline: "Don’t just trust. Own the truth."

This repo contains the folders for an *E-commerce Marketplace* standalone blockchain built with the polkadot sdk along with a frontend client which is a vercel hosted ecommerce webapp - Genesis marketplace. The extrinsics of the custom blockchain can be called both from polkadot.js.org/apps and from the frontend client included here. The custom chain has a custom pallet - "marketplace" that exposes extrinsics.

[![Github Public Repo Link](https://github.com/Akaninyang/E-commerce-Custom-Blockchain-and-Client)]
[![Live Frontend Demo Link](https://)]
[![Blockchain](wss://genesis-authentic.onrender.com)This can be used to test the chain extrinsics on(https://polkadot.js.org/apps)]
[![Demo Video Link](https://)]

## **Project Overview 🔥**

Genesis Authentic Marketplace is a Web3 e-commerce marketplace enabling:  
- NFT-style ownership of products  
- Optional physical redemption of owned products  
- Secure buying, listing, and unlisting of products as digital NFTs and physical twins
- Verified manufacturer management  

Objectives:  
1. Build a *trustless e-commerce platform that exists on its own custom blockchain*  
2. Enable *NFT-style digital ownership of physical goods*  
3. Develop a **modular pallet-marketplace**  
4. Connect the e-commerce frontend with *Polkadot.js* and the custom chain for seamless transactions  


## **Features**

- Product lifecycle: list(as a creator or genesis owner), buy, re-list(as mid-level owner), unlist, redeem(trigger door delivery sequence) 
- Manufacturer management: register/unregister  
- Admin management with future *decentralized governance*  
- Future-ready fiat-to-onchain integration  

## **Extrinsics from pallet-marketplace**

- *list_product()* - This allows a registered manufacturer to list new products on the open market for sale and  mint an NFT tied to the listing.

- *buy_product()* - This allows users to purchase listed products of their choice.

- *register_manufacturer()* - This is used to authorize an account to list products and mint their NFT.

- *toggle_sale()* - This allows user accounts to re-list products they've purchased from registered manufaturers or creators on the marketplace.

- *redeem_product()* - This triggers physical delivery of a purchased product.

- *unregister_manufacturer()* - This removes an existing manufacturer in the event of violations.

- *set_admin()* - This sets the authority for registering or unregistering manufacturers.

## **Tech Stack & Dependencies**

- *Blockchain:* Substrate, Polkadot, Rust, FRAME  
- *Frontend:* React, Polkadot.js  
- *Deployment:* Docker, GitHub Actions, Vercel, Render  
- *Build Tools:* Cargo, npm  

## **Resource Credits**

- [![Open Source Image assets from](https://unsplash.com)]
- [![Substrate solochain node template](https://github.com/paritytech/polkadot-sdk-solochain-template)]
- Polkadot-sdk 
- Polkadot.js wallet extension


## **Setup & Installation**

```bash
## Clone the Repo and Run the Node Locally
git clone https://github.com/Akaninyang/E-commerce-Custom-Blockchain-and-Client
cd ecommerce-node
cargo build --release
./target/release/ecommerce-chain-node --dev

#Build and Interact with the chain locally using
#[Polkadot-Substrate-Portal](https://polkadot.js.org/apps/#/explorer?rpc=ws://localhost:9944)
// Alice is set as the sudo account, so use Alice to set admin or transfer funds to your wallet for testing if you wish to interact with the chain from the frontend using a test wallet you own

## Frontend Setup For Local Dev
##Run in another terminal
cd genesis-marketplace
npm install
npm run dev