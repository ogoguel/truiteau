game.splash("_- TRUITEAU -_", "Just In Time")

let myGame = new GameController()
myGame.launchGame();

game.onPaint(function () {
    myGame.paint()
})

game.onUpdateInterval(30, function () {
    myGame.mainLoop()
})