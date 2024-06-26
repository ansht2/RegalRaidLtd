import Phaser from 'phaser';
import GameManager from "../objects/gameManager";
import {Keypair} from "@solana/web3.js";
import blockchainClient from "./transaction";
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice';

const textStyle = {
  fontSize: '18px',
  color: '#000', 
  padding: { x: 10, y: 5 },
  fontFamily: 'Garamond' // You can specify your desired font family here
};

function createInstructionsPopup(scene) {
  
  let graphics = scene.add.graphics();
  // graphics.fillStyle(0xffffff, 0.8);
  // graphics.fillRect(100, 400, 600, 200); 
  let background = scene.add.rectangle(0, 0, scene.cameras.main.width, scene.cameras.main.height, 0x000000, 0.4);
  background.setOrigin(0);

  const waterBorder = scene.createNineSlice(400, 500, 650, 200, 20, 20, 20, 20);
  waterBorder.setTint(0xFFFFFF);
  let instructions = "Your mission, should you choose to accept it, is to capture the most land area.\n \nChoose a country by clicking one of the cells.";
  let text = scene.add.text(400, 500, instructions, { ...textStyle, fontSize: '25px', color: '#000', align: 'center', wordWrap: { width: 580 } });
  text.setOrigin(0.5, 0.5);
  
  let closeButton = scene.add.text(690, 410, 'x', { fontSize: '25px', color: '#ff0000' });
  closeButton.setInteractive();
  closeButton.on('pointerdown', function () {
    graphics.clear();
    text.setVisible(false);
    closeButton.setVisible(false);
    background.setVisible(false);
    waterBorder.setVisible(false);
    scene.instructionsRead = true;
  });
}

function createNamePrompt(scene) {
  let graphics = scene.add.graphics();
  graphics.fillStyle(0xffffff, 0.8);
  graphics.fillRect(100, 100, 600, 200);

  let text = scene.add.text(400, 200, 'Enter your name:', { fontSize: '32px', color: '#000' });
  text.setOrigin(0.5, 0.5);

  let input = scene.add.dom(400, 250).createFromHTML('<input type="text" name="playerName" style="width: 200px; padding: 5px;">');
  let submitButton = scene.add.text(400, 300, 'Submit', { fontSize: '32px', color: '#000' });
  submitButton.setInteractive();
  submitButton.setOrigin(0.5, 0.5);

  submitButton.on('pointerdown', function () {
    let playerName = input.getChildByName('playerName').value;
    if (playerName.trim() !== '') {
      console.log('Player Name: ', playerName);
      // You can now remove the graphics, text, and input, or hide them
      graphics.clear();
      text.setVisible(false);
      input.setVisible(false);
      submitButton.setVisible(false);
      // Call the function to display the instructions popup
      createInstructionsPopup(scene);
    }
  });
}


export default class CountryScene extends Phaser.Scene {
  private cellSize: number = 48; // Size of each cell in pixels
  private gridWidth: number = 27; // Width of the grid in cells
  private gridHeight: number = 18; // Height of the grid in cells
  private country: { x: number; y: number } | null = null; // Store the selected cell index
  private selectedCell: Phaser.GameObjects.Rectangle | null = null; // Reference to the selected cell for changing color

  public instructionsRead: boolean = false;

  constructor() {
    super('CountryScene');

  }


  preload(): void {
    this.load.image('background', 'assets/img/background.png');
    this.load.image('border1', 'assets/Panel/panel-026.png');
    // Preload assets if any
  }

  create(): void {
    const sprite = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background')
        .setDisplaySize(this.scale.width, this.scale.height); // Adjust size to fit the screen
    this.drawGrid(); 
    

    // Check if preFX exists
if (sprite.preFX !== null) {
  // Add initial blur
  sprite.preFX.addBlur(1, undefined, undefined, 0.3);
  sprite.preFX.addBloom();  
  // const shineFX = sprite.preFX.addShine(0.25);  

}


    createInstructionsPopup(this);

  }

  update(time: number, delta: number): void {
    // Update logic
  }
  private createNineSlice(x: number, y: number, width: number, height: number, leftWidth: number, rightWidth: number, topHeight: number, bottomHeight: number) {
    return this.add.nineslice(
        x,              // x-coordinate
        y,              // y-coordinate
        'border1',       // texture key
        undefined,      // frame (optional)
        width,          // width
        height,         // height
        leftWidth,      // leftWidth
        rightWidth,     // rightWidth
        topHeight,      // topHeight
        bottomHeight    // bottomHeight
    );
  }
  private drawGrid(): void {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        let cell = this.add.rectangle(
            x * this.cellSize + this.cellSize / 2, // Calculate the x position
            y * this.cellSize + this.cellSize / 2, // Calculate the y position
            this.cellSize, // Rectangle width
            this.cellSize, // Rectangle height
            0xCCCCCC, // Color of the rectangle
            0
        ).setStrokeStyle(1, 0x000000); // Add a black stroke to the rectangle 
        cell.setInteractive().on('pointerdown', () => {
          if (this.instructionsRead){
            if (this.country) {
              // Reset the previously selected cell to its original color
              // this.selectedCell.setFillStyle(0xCCCCCC, 0);
            } else {
              //if ()
              // Highlight the new selected cell in blue
              cell.setFillStyle(0x0000FF, 0.6);
              // Store the selected cell reference for future clicks
              this.selectedCell = cell;
              // Store the index of the selected cell
              const gameManager = this.registry.get('gameManager');
              gameManager.country = {x,y};
              this.country = {x, y};

              console.log(`Selected country index: ${x}, ${y}`); // For debugging
              gameManager.ownedTerritories.push(this.country);

              let gameAcc = this.registry.get('gameAccount');
              let prvAcc = this.registry.get('privateKey')
              let username = this.registry.get('username');
              new blockchainClient(prvAcc).choose_country(prvAcc,username,gameAcc, this.country).then(()=>{
                this.scene.start('MainScene');
              })


            }
          }
        });
      }
    }
  }
}
