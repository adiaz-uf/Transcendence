import json
import math
import random

class PongGame:
    def __init__(self, width=900, height=700):
        self.__left_player = None
        self.__right_player = None
        self.__width = width
        self.__height = height
        self.__speed_ball = 3
        self.__max_score = 5
        self.reset_game()

    def get_gameState(self):
        return {self.__players, self.__ball, self.game_active}

    def reset_game(self):
        # Players State
        self.__players = {
            'left': {
                'id':self.__left_player,
                'x': 10,
                'y': self.height / 2 - 50,
                'width': 15,
                'height': 115,
                'speed': 5,
                'score': 0
            }, 
            'right': {
                'id':self.__right_player,
                'x': self.__width - 20,
                'y': self.__height / 2 - 50,
                'width': 15,
                'height': 115,
                'speed': 5,
                'score': 0
            }
        }

        # Ball State
        self.__ball = {
            'x': self.__width / 2,
            'y': self.__height / 2,
            'radio': 5,
            'rx': random.choice([-(self.__speed_ball), (self.__speed_ball)]),
            'ry': random.choice([-(self.__speed_ball), (self.__speed_ball)])
        }
        # Main Game loop
        self.game_active = False

    def move_players(self, side, direction):
        player = self.players[side]

        if direction == 'up':
            player['y'] = max(0, player['y'] - player['speed'])

        elif direction == 'down':
            player['y'] = min(self.height - player['height'], player['y'] + player['speed'])

    def update_ball(self):

        # Ball position
        self.ball['x'] += self.ball['rx']
        self.ball['y'] += self.ball['ry']

        # Vertical collision
        if (self.ball['y'] <= 0 or 
            self.ball['y'] >= self.height):
            self.ball['ry'] *= -1

        # Collision with player paddle
        for side, paddle in self.players.items():
            if self.check_ball_paddle_collision(paddle):
                self.ball['rx'] *= -1.1  # increase ball speed
                break

        #Points
        if self.ball['x'] <= 0:
            self.players['left']['score'] += 1
            self.reset_ball('left')
        elif self.ball['x'] >= self.width:
            self.players['right']['score'] += 1
            self.reset_ball('right')

    def check_ball_paddle_collision(self, paddle):
        return (
            (self.ball['x'] >= paddle['x']) and 
            (self.ball['x'] <= paddle['x'] + paddle['width']) and
            (self.ball['y'] >= paddle['y']) and 
            (self.ball['y'] <= paddle['y'] + paddle['height'])
        )

    def reset_ball(self, scoring_side):
        self.ball['x'] = self.width / 2
        self.ball['y'] = self.height / 2
        self.ball['rx'] = (self.speed_ball) if scoring_side == 'right' else -(self.speed_ball)
        self.ball['ry'] = random.choice([-(self.speed_ball), (self.speed_ball)])

    def endGame(self):
        if self.players['left']['score'] == self.max_score or self.players['right']['score'] == self.max_score:
            self.game_active = False


    
        
