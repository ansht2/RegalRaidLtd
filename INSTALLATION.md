# TerraQuest Installation

```bash
# Clone phaser repository (yes, npx not npm)
$ npx gitget yandeu/phaser-project-template phaser-template

# Go into the repository
$ cd phaser-template

# Install dependencies
$ npm install

# Delete original src
$ rm -f src

# Clone src code
$ git clone https://github.com/ansht2/TQ.git src

# Start the local development server (on port 8080)
$ npm start
```