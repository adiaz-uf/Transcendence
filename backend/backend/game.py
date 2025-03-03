class PongGame:
    def __init__(self):
        self.game_active = True
        self.ball = {"x": 50, "y": 50, "vx": 5, "vy": 5}
        self.paddles = {"player1": 40, "player2": 40}
        self.scores = {"player1": 0, "player2": 0}

    def update(self):
        if not self.game_active:
            return

        self.ball["x"] += self.ball["vx"]
        self.ball["y"] += self.ball["vy"]

        if self.ball["y"] <= 0 or self.ball["y"] >= 100:
            self.ball["vy"] *= -1

        if self.ball["x"] <= 5 and abs(self.paddles["player1"] - self.ball["y"]) < 10:
            self.ball["vx"] *= -1
        if self.ball["x"] >= 95 and abs(self.paddles["player2"] - self.ball["y"]) < 10:
            self.ball["vx"] *= -1

        if self.ball["x"] <= 0:
            self.scores["player2"] += 1
            self.reset_ball()
        elif self.ball["x"] >= 100:
            self.scores["player1"] += 1
            self.reset_ball()

    def reset_ball(self):
        self.game_active = False
        self.ball = {"x": 50, "y": 50, "vx": 5, "vy": 5}

    def start_game(self):
        self.game_active = True 

game = PongGame()
