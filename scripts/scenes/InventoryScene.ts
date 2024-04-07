import Phaser from 'phaser';

// Sample NFT data
const nfts = [
    { name: "Admiral", rarity: "Common", inUse: false, image:'assets/img/AdmiralMonkey.png' }, 
    { name: "Wukong", rarity: "Common", inUse: false, image:'assets/img/WukongMonkey.png' },  
    { name: "King", rarity: "Rare", inUse: false, image: 'assets/img/CrownMonkey.png' }, 
    { name: "General", rarity: "Rare", inUse: false, image: 'assets/img/GeneralMonkey.png' }, 
    { name: "King", rarity: "Legendary", inUse: false, image: 'assets/img/CrownMonkey.png' }, 
    { name: "General", rarity: "Legendary", inUse: false, image: 'assets/img/GeneralMonkey.png' }, 
    { name: "Wukong", rarity: "Legendary", inUse: false, image:'assets/img/WukongMonkey.png' },
    { name: "King", rarity: "Legendary", inUse: false, image: 'assets/img/CrownMonkey.png' }, 
    { name: "General", rarity: "Legendary", inUse: false, image: 'assets/img/GeneralMonkey.png' }, 
    { name: "Admiral", rarity: "Legendary", inUse: false, image:'assets/img/AdmiralMonkey.png' },
    { name: "King", rarity: "Legendary", inUse: false, image: 'assets/img/CrownMonkey.png' }, 
    { name: "General", rarity: "Legendary", inUse: false, image: 'assets/img/GeneralMonkey.png' }, 
    { name: "Wukong", rarity: "Legendary", inUse: false, image:'assets/img/WukongMonkey.png' },
    { name: "King", rarity: "Legendary", inUse: false, image: 'assets/img/CrownMonkey.png' }, 
    { name: "General", rarity: "Legendary", inUse: false, image: 'assets/img/GeneralMonkey.png' },
    { name: "Admiral", rarity: "Legendary", inUse: false, image:'assets/img/AdmiralMonkey.png' }, 
    // Add more sample NFTs as needed
];

export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super('InventoryScene');
    }

    preload() {
        // Preload NFT images
        nfts.forEach(nft => {
            this.load.image(nft.name, nft.image);
        });
    }

    create() {
        // Background
        const textStyle = {
            fontSize: '18px',
            color: '#000', 
            padding: { x: 10, y: 5 },
            fontFamily: 'Garamond' // You can specify your desired font family here
        };

        const background = this.add.image(0, 0, 'background').setOrigin(0);
        background.displayWidth = this.game.config.width as number;
        background.displayHeight = this.game.config.height as number;
        this.cameras.main.setBackgroundColor('#0a2948');

        // Create and position the title
        const title = this.add.text(this.game.config.width as number / 2, 30, 'User NFT Inventory', { ...textStyle, fontSize: '24px', color: '#FFFFFF' }).setOrigin(0.5).setData('persistent', true);

        // Display sorting dropdown
        const sortingSelect = this.add.dom(300, 70, 'select');
        sortingSelect.node.id = 'sorting';
        sortingSelect.node.innerHTML = `
            <option value="All">All</option>
            <option value="Legendary">Legendary</option>
            <option value="Rare">Rare</option>
            <option value="Common">Common</option>
        `;

        sortingSelect.addListener('change');

        // Display NFT cards
        this.renderInventory(nfts);
        
        // Handle sorting
        sortingSelect.on('change', (event: any) => {
            const sortingOption = event.target.value;
            this.sortNFTs(sortingOption);
        });
    }

    sortNFTs(sortingOption: string) {
        let sortedNFTs;
        switch (sortingOption) {
            case 'All':
                sortedNFTs = nfts;
                break;
            case 'Legendary':
                sortedNFTs = nfts.filter(nft => nft.rarity === 'Legendary');
                break;
            case 'Rare':
                sortedNFTs = nfts.filter(nft => nft.rarity === 'Rare');
                break;
            case 'Common':
                sortedNFTs = nfts.filter(nft => nft.rarity === 'Common');
                break;
            default:
                sortedNFTs = nfts; // Show all NFTs
        }
        // Sort by rarity within the filtered array
        sortedNFTs.sort((a, b) => {
            const rarityOrder = { 'Common': 0, 'Rare': 1, 'Epic': 2, 'Legendary': 3 };
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        });
    
        this.renderInventory(sortedNFTs);
    }
    
    renderInventory(nftsToRender: any[]) {
        const textStyle = {
            fontSize: '18px',
            color: '#000', 
            padding: { x: 10, y: 5 },
            fontFamily: 'Garamond' // You can specify your desired font family here
        };
    
        // Remove previous inventory cards and dropdowns
        this.children.each(child => {
            if (child.type === 'Image' || child.type === 'Text') {
                if (child.getData('persistent')) return;
                child.destroy();
            }
        });
        this.children.each(child => {
            if (child.type === 'Text' && !child.getData('persistent')){   
                child.destroy();
            }
        });
    
        // Display NFT cards
        let x = 100;
        let y = 130;
        let rowCounter = 0;
        nftsToRender.forEach(nft => {
            const card = this.add.image(x, y, nft.name).setOrigin(0.5).setDisplaySize(145, 145); // Set size of the card
            card.setInteractive();
    
            // Handle card click event
            card.on('pointerdown', () => {
                console.log(`Selected ${nft.name}`);
                // Deselect all NFTs
                nfts.forEach(n => {
                    n.inUse = false;
                });
                // Select the clicked NFT
                nft.inUse = true;
                // Update the inventory
                this.renderInventory(nftsToRender);
            });
    
            x += 150;
            rowCounter++;
            if (rowCounter === 8) { // Adjusted to 8 images per row
                rowCounter = 0;
                x = 100;
                y += 200;
            }
    
            if (nft.inUse) {
                card.setTint(0xFFD700); // Highlight the selected NFT with a gold tint
                card.postFX.addShine();
            }
        });
    
        // Display NFT names and rarities
        nftsToRender.forEach((nft, index) => {
            const textX = 100 + (index % 8) * 150;
            const textY = 130 + Math.floor(index / 8) * 200 + 100;
            this.add.text(textX, textY, `${nft.name}\n(${nft.rarity})`, { ...textStyle, fontSize: '20px', color: '#FFFFFF', align: 'center' }).setOrigin(0.5);
        });
    }
}
