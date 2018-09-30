const Jimp = require('jimp')

const radius = {x: 7, y: 15}
const mainColours = {
    'background': 0xe0d8bdff,
    // 'goal': ,
    // 'solo': ,
    // 'postmortem': ,
    // 'trap': ,
    // 'coin': ,
    // 'comeback': ,
    // 'first': ,
    // 'second': ,
    // 'third': ,
    // 'fourth': ,
}
const testPixels = [
    [],
    [],
    [],
    []
]
const playerScores = [0, 0, 0, 0]

const xInit = 492
const yHeights = [315, 475, 632, 793]

let colourDistanceSquared = (a, b) => {
    let uA = Jimp.intToRGBA(a)
    let uB = Jimp.intToRGBA(b)
    return (uA.r - uB.r) ** 2 + (uA.g - uB.g) ** 2 + (uA.b - uB.b) ** 2
}

let getScores = (image) => {
    return new Promise((resolve, reject) => {
        if (image.bitmap.width !== 1920 || image.bitmap.height !== 1080) {
            return reject('Please provide a 1920x1080 screenshot')
        }

        let yInit = 0
        image.scan(xInit, 200, 1, 100, (x, y, idx) => {
            if (yInit !== 0) {
                return
            }
            let r = image.bitmap.data[idx + 0]
            let g = image.bitmap.data[idx + 1]
            let b = image.bitmap.data[idx + 2]

            let colour = Jimp.rgbaToInt(r, g, b, 255)
            // image.setPixelColor(0xFF0000FF, x-1, y)
            if (colourDistanceSquared(colour, mainColours.background) < 1000) {
                return
            }/* else {
                console.log(colourDistanceSquared(colour, mainColours.background))
            }*/
            yInit = y
        })

        let previous = 'foreground'
        let current = undefined
        let foregrounds = []
        image.scan(xInit + 4, yInit, image.bitmap.width - (xInit + 4), 1, (x, y, idx) => {
            let r = image.bitmap.data[idx + 0]
            let g = image.bitmap.data[idx + 1]
            let b = image.bitmap.data[idx + 2]

            let colour = Jimp.rgbaToInt(r, g, b, 255)
            if (colourDistanceSquared(colour, mainColours.background) < 1000) {
                current = 'background'
            } else {
                current = 'foreground'
            }

            if (previous === 'background' && current === 'foreground') {
                // image.setPixelColor(0xFF0000FF, x, y - 1)
                foregrounds.push(x)
            }
            previous = current
        })
        if (current === 'background') {
            foregrounds.push(image.bitmap.width)
        }

        let xStep = (foregrounds[1] - foregrounds[0]) / 5
        let ySections = foregrounds.length - 1

        for (let i = 0; i < testPixels.length; i++) {
            for (let j = 0; j < ySections; j++) {
                for (let k = 0; k < 5; k++) {
                    testPixels[i][j * 5 + k] = {x: Math.round(xInit + j * xStep * 5 + xStep * k + xStep / 2), y: yHeights[i]}
                }
            }
            testPixels[i][ySections * 5 - 1].x -= xStep / 4
        }

        testPixels.forEach((playerPixels, playerIndex) => {
            playerPixels.forEach(coordinates => {
                let x = coordinates.x
                let y = coordinates.y

                let startX = Math.max(0, x - radius.x)
                let startY = Math.max(0, y - radius.y)
                let width = Math.min(radius.x * 2, image.bitmap.width - startX)
                let height = Math.min(radius.y * 2, image.bitmap.height - startY)

                let colours = {}
                let colourSum = Jimp.intToRGBA(0)
                let count = 0

                // image.setPixelColor(0xFF0000FF, x, y)
                image.scan(startX, startY, width, height, (x, y, idx) => {
                    let r = image.bitmap.data[idx + 0]
                    let g = image.bitmap.data[idx + 1]
                    let b = image.bitmap.data[idx + 2]

                    let colour = Jimp.rgbaToInt(r, g, b, 255)
                    
                    colourSum.r += r
                    colourSum.g += g
                    colourSum.b += b
                    count++
                    // image.setPixelColor(0xFF0000FF, x, y)
                })

                if (count !== 0) {
                    let colourAverage = Jimp.rgbaToInt(Math.round(colourSum.r / count), Math.round(colourSum.g / count), Math.round(colourSum.b / count), 255)

                    if (colourDistanceSquared(colourAverage, mainColours.background) < 1000) {
                        return
                    }

                    playerScores[playerIndex]++
                }
            })
        })
        resolve(playerScores)
    })
}

module.exports = (imageUrl) => {
    return Jimp.read(imageUrl).then(getScores)
}