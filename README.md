# uch-image-detection
A node module to interpret screenshots of UCH

## Installation

This module is installed via npm:

```
npm install --save uch-image-detection
```

## Usage

``` js
const imageUrl = 'test-image.png'

const uchImageDetection = require('uch-image-detection');

uchImageDetection(imageUrl)
	.then((playerScores) => {
		console.log(playerScores)
	})
	.catch((error) => {
		console.error(error)
	})
```
