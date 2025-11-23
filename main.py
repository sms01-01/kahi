import pygame
import sys
import os
from game.player import Player
from game.levels import Level
from game.vision import VisionSystem

class Game:
    def __init__(self):
        pygame.init()
        self.screen_width = 800
        self.screen_height = 600
        self.screen = pygame.display.set_mode((self.screen_width, self.screen_height))
        pygame.display.set_caption("Kahina et l'Oracle Oublié")
        
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Couleurs
        self.bg_color = (30, 30, 50)
        self.text_color = (255, 255, 255)
        
        # Police
        self.font = pygame.font.Font(None, 36)
        
        # Créer le niveau et le joueur
        self.level = Level()
        self.player = Player(100, 400)
        self.vision_system = VisionSystem()
        
        # État du jeu
        self.game_state = "playing"  # "playing", "win", "lose"
        
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif event.key == pygame.K_v:
                    self.vision_system.toggle_vision()
                elif event.key == pygame.K_r and self.game_state != "playing":
                    self.restart_game()
    
    def update(self):
        if self.game_state == "playing":
            keys = pygame.key.get_pressed()
            self.player.update(keys, self.level.platforms)
            
            # Vérifier si le joueur a atteint l'oracle
            if self.check_win_condition():
                self.game_state = "win"
            
            # Vérifier si le joueur est tombé
            if self.player.rect.y > self.screen_height:
                self.game_state = "lose"
    
    def check_win_condition(self):
        oracle_rect = pygame.Rect(700, 300, 50, 50)
        return self.player.rect.colliderect(oracle_rect)
    
    def draw(self):
        # Fond d'écran
        self.screen.fill(self.bg_color)
        
        if self.vision_system.active:
            # Mode vision activé - afficher les éléments cachés
            self.screen.fill((20, 20, 40))  # Fond différent
            self.level.draw_vision_mode(self.screen)
        else:
            # Mode normal
            self.level.draw(self.screen)
        
        # Dessiner le joueur
        self.player.draw(self.screen)
        
        # Interface utilisateur
        self.draw_ui()
        
        # Écrans de fin
        if self.game_state == "win":
            self.draw_win_screen()
        elif self.game_state == "lose":
            self.draw_lose_screen()
        
        pygame.display.flip()
    
    def draw_ui(self):
        # Barre de vision
        vision_text = self.font.render("Vision: ACTIVE" if self.vision_system.active else "Vision: READY", True, self.text_color)
        self.screen.blit(vision_text, (10, 10))
        
        # Instructions
        instructions = self.font.render("V: Vision  |  R: Recommencer", True, self.text_color)
        self.screen.blit(instructions, (10, 50))
    
    def draw_win_screen(self):
        overlay = pygame.Surface((self.screen_width, self.screen_height))
        overlay.set_alpha(180)
        overlay.fill((0, 0, 0))
        self.screen.blit(overlay, (0, 0))
        
        win_text = self.font.render("Félicitations Kahina ! L'Oracle est retrouvé !", True, (255, 215, 0))
        restart_text = self.font.render("Appuyez sur R pour recommencer", True, self.text_color)
        
        self.screen.blit(win_text, (self.screen_width//2 - win_text.get_width()//2, self.screen_height//2 - 50))
        self.screen.blit(restart_text, (self.screen_width//2 - restart_text.get_width()//2, self.screen_height//2 + 20))
    
    def draw_lose_screen(self):
        overlay = pygame.Surface((self.screen_width, self.screen_height))
        overlay.set_alpha(180)
        overlay.fill((0, 0, 0))
        self.screen.blit(overlay, (0, 0))
        
        lose_text = self.font.render("Kahina a échoué...", True, (255, 50, 50))
        restart_text = self.font.render("Appuyez sur R pour recommencer", True, self.text_color)
        
        self.screen.blit(lose_text, (self.screen_width//2 - lose_text.get_width()//2, self.screen_height//2 - 50))
        self.screen.blit(restart_text, (self.screen_width//2 - restart_text.get_width()//2, self.screen_height//2 + 20))
    
    def restart_game(self):
        self.player = Player(100, 400)
        self.vision_system = VisionSystem()
        self.game_state = "playing"
    
    def run(self):
        while self.running:
            self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(60)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()
