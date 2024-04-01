import Phaser, {Game} from 'phaser';
import blockchainClient from './transaction';
import GameManager from "../objects/gameManager";
import {use} from "matter";
export default class LoginScene extends Phaser.Scene {
  private walletIdInputText: Phaser.GameObjects.Text;
  private secretKeyInputText: Phaser.GameObjects.Text;
  private walletId: string = '';
  private secretKey: string = '';
  private isEnteringWalletId: boolean = true;
  private controlPress: boolean = false;

  constructor() {
    super('LoginScene');
  }

  preload(): void {
    // Load the logo image
    this.load.image('logo', 'assets/img/Designer (1).png');
  }

  create(): void {
    // set general styling (currently subjec to change)
    const textStyle = {
      fontSize: '18px',
      color: '#000', 
      padding: { x: 10, y: 5 },
      fontFamily: 'Garamond' // You can specify your desired font family here
  };
  

    // Using a color from the image, such as a deep ocean blue
    this.cameras.main.setBackgroundColor('#0a2948');
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2 - 100; // Adjusted from -300 to -100


    function createStyledText(scene, x, y, text, style) {
      return scene.add.text(x, y, text, {
          fontSize: style.fontSize || '18px',
          color: style.color || '#000',
          backgroundColor: style.backgroundColor || 'rgba(255, 255, 255, 1)',
          padding: style.padding || { x: 10, y: 5 },
          fontFamily: style.fontFamily || 'Garamond'
      }).setOrigin(0.5, 0);
  }
   
    // Add the logo image
    const logo = this.add.image(centerX, centerY, 'logo').setOrigin(0.5, 0.5);
    logo.setScale(0.25); // Scale the logo if needed
    
    // Draw rectangle
    const rectangleWidth = 1280;
    const rectangleHeight = 500;
    const rectangleX = centerX;
    const rectangleY = centerY + 150;  
    const rectangle = this.add.graphics();
    rectangle.fillStyle(0x060918, 1);  
    rectangle.fillRoundedRect(rectangleX - rectangleWidth / 2, rectangleY, rectangleWidth, rectangleHeight, 20); // Rounded corners

    // Labels with a color inspired by the sandy tan from the image
    this.add.text(centerX, centerY + 170, 'Username:', { ...textStyle, backgroundColor: 'rgba(255, 255, 255, 0)', fontSize: '24px', color: '#FFFFFF' }).setOrigin(0.5, 0);
    this.add.text(centerX, centerY + 270, 'Secret Key:', { ...textStyle, backgroundColor: 'rgba(255, 255, 255, 0)', fontSize: '24px', color: '#FFFFFF' }).setOrigin(0.5, 0);

    // Input texts with a slight transparent background to blend with the scene
    this.walletIdInputText = this.add.text(centerX, centerY + 210, '', {...textStyle, backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: { x: 10, y: 5 } }).setOrigin(0.5, 0);
    this.secretKeyInputText = this.add.text(centerX, centerY + 310, '', { ...textStyle, backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: { x: 10, y: 5 } }).setOrigin(0.5, 0);

    // Interactive areas to detect which field is being typed into
    this.makeInteractive(this.walletIdInputText, true);
    this.makeInteractive(this.secretKeyInputText, false);

    // Keyboard input
    // this.input.keyboard!.on('paste', (event) => this.handlePaste(event));
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => this.handleKeyInput(event));

    createStyledText(this, centerX+550, centerY+120, 'Regal Raid Limited (c)', {backgroundColor: '#0a2948'});

    // Submit Button with a color that complements the overall theme
      
    const submitButton = this.add.graphics()
      .setInteractive(new Phaser.Geom.Rectangle(centerX - 100, centerY + 400, 200, 50), Phaser.Geom.Rectangle.Contains)
      .fillStyle(0x467f43)
      .fillRoundedRect(centerX - 76, centerY + 375, 150, 50, 10)
      .setInteractive()
      .on('pointerdown', () => this.submitForm());

    const buttonText = this.add.text(centerX, centerY + 400, 'Submit', { ...textStyle, fontSize: '28px', color: '#FFFFFF' }).setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.submitForm()); 
  }
  
  // ... rest of the class methods remain the same
  

  private makeInteractive(textObject: Phaser.GameObjects.Text, isWalletId: boolean): void {
    textObject.setInteractive()
      .on('pointerdown', () => {
        this.isEnteringWalletId = isWalletId;
        // Optionally, add visual feedback or a cursor effect
      });
  }

  private handleKeyInput(event: KeyboardEvent): void {
    if (this.isEnteringWalletId) {
      this.walletId = this.handleTextInput(event, this.walletId);
      this.walletIdInputText.setText(this.walletId);
    } else {
      this.secretKey = this.handleTextInput(event, this.secretKey);
      this.secretKeyInputText.setText('*'.repeat(this.secretKey.length));
    }
  }

  private handleTextInput(event: KeyboardEvent, text: string): string {
    if (event.keyCode === 8) { // Backspace
      return text.slice(0, -1);
    } else if (event.keyCode === 13) { // Enter
      this.isEnteringWalletId = !this.isEnteringWalletId;
      return text;
    } else if (event.ctrlKey && (event.key == 'v' || event.key == 'V')) {
      let thistext = '';
      console.log("Paste pressed!")
      window.navigator.clipboard.readText().then((text)=>{
          console.log("pressed", text);
          thistext = text;
        if (this.isEnteringWalletId) {
          this.walletId = text;
          this.walletIdInputText.setText(this.walletId);
        } else {
          this.secretKey = text;
          this.secretKeyInputText.setText('*'.repeat(this.secretKey.length));
        }
    });

    } else if (/^[a-zA-Z0-9]$/.test(event.key)) {
      return text + event.key;
    }
    return text;
  }

  private submitForm(): void {
    if (this.walletId.trim() !== '' && this.secretKey.trim() !== '') {
      // Proceed with the game
      console.log('Wallet ID:', this.walletId); // For debugging

      console.log("parsing", this.secretKey);
      let parsed = JSON.parse(this.secretKey);
      console.log("parsed", parsed);
      new blockchainClient(new Uint8Array(parsed)).login(new Uint8Array(parsed), this.walletId).then(
          (gameAcc) => {
            this.registry.set('gameAccount', gameAcc);
            this.registry.set('privateKey', new Uint8Array(parsed));
            this.registry.set('username', this.walletId);
            console.log('Secret Key:', this.secretKey); // For debugging
            let gm = new GameManager(this.walletId);
            gm.player_name =  this.walletId;
            console.log(gm.player_name)
            this.registry.set('gameManager', gm);
            this.scene.start('CountryScene');
          }
      );

 
    } else {
      // Handle the error case
      console.warn('Please enter both wallet ID and secret key.');
    }
  }

  // handlePaste(event){
  //   console.log("Handling paste!")
  //   event.preventDefault();
  //   const text = (event.clipboardData).getData('text');
  //   if (this.isEnteringWalletId) {
  //     this.walletId = text;
  //     this.walletIdInputText.setText(this.walletId);
  //   } else {
  //     this.secretKey = text;
  //     this.secretKeyInputText.setText('*'.repeat(this.secretKey.length));
  //   }
  // }
}
