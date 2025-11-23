import pygame

class Level:
    def __init__(self):
        self.platforms = [
            # Plateformes de base
            pygame.Rect(0, 500, 300, 20),
            pygame.Rect(350, 500, 200, 20),
            pygame.Rect(600, 500, 200, 20),
            
            # Plateformes élevées
            pygame.Rect(200, 400, 100, 20),
            pygame.Rect(400, 350, 100, 20),
            pygame.Rect(600, 300, 150, 20),  # Plateforme avec l'oracle
            
            # Plateformes invisibles (visibles seulement en mode vision)
            pygame.Rect(300, 200, 80, 15),
            pygame.Rect(500, 250, 80, 15),
        ]
        
        self.visible_platforms = self.platforms[:6]  # Les 6 premières sont toujours visibles
        self.hidden_platforms = self.platforms[6:]   # Les 2 dernières sont cachées
        
        self.platform_color = (120, 80, 160)
        self.hidden_color = (80, 160, 240)
        
        # Pièges
        self.traps = [
            pygame.Rect(320, 480, 30, 20),
            pygame.Rect(550, 480, 30, 20),
        ]
        
        self.trap_color = (220, 60, 60)
    
    def draw(self, screen):
        # Dessiner les plateformes visibles
        for platform in self.visible_platforms:
            pygame.draw.rect(screen, self.platform_color, platform)
        
        # Dessiner les pièges
        for trap in self.traps:
            pygame.draw.rect(screen, self.trap_color, trap)
        
        # Dessiner l'oracle
        oracle_rect = pygame.Rect(700, 300, 50, 50)
        pygame.draw.rect(screen, (255, 215, 0), oracle_rect)  # Or
        pygame.draw.circle(screen, (255, 255, 255), oracle_rect.center, 15)
    
    def draw_vision_mode(self, screen):
        # En mode vision, tout est visible
        for platform in self.platforms:
            pygame.draw.rect(screen, self.hidden_color, platform)
        
        # Les pièges sont plus visibles
        for trap in self.traps:
            pygame.draw.rect(screen, (255, 100, 100), trap)
            pygame.draw.rect(screen, (255, 200, 200), trap, 2)
        
        # L'oracle brille
        oracle_rect = pygame.Rect(700, 300, 50, 50)
        pygame.draw.rect(screen, (255, 255, 200), oracle_rect)
        pygame.draw.circle(screen, (255, 255, 0), oracle_rect.center, 20)
        
        # Effet de pulsation pour l'oracle
        import time
        pulse = int((pygame.time.get_ticks() % 1000) / 1000 * 255)
        pygame.draw.circle(screen, (255, 255, pulse), oracle_rect.center, 10)
