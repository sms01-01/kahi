import pygame

class Player:
    def __init__(self, x, y):
        self.rect = pygame.Rect(x, y, 30, 50)
        self.color = (180, 100, 220)  # Violet pour Kahina
        self.velocity_y = 0
        self.jump_power = -15
        self.gravity = 0.8
        self.speed = 5
        self.on_ground = False
    
    def update(self, keys, platforms):
        # Mouvement horizontal
        if keys[pygame.K_LEFT]:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT]:
            self.rect.x += self.speed
        
        # Saut
        if keys[pygame.K_SPACE] and self.on_ground:
            self.velocity_y = self.jump_power
            self.on_ground = False
        
        # Gravité
        self.velocity_y += self.gravity
        self.rect.y += self.velocity_y
        
        # Collisions avec les plateformes
        self.on_ground = False
        for platform in platforms:
            if self.rect.colliderect(platform):
                # Collision par le dessus
                if self.velocity_y > 0 and self.rect.bottom > platform.top and self.rect.top < platform.top:
                    self.rect.bottom = platform.top
                    self.velocity_y = 0
                    self.on_ground = True
                # Collision par le dessous
                elif self.velocity_y < 0 and self.rect.top < platform.bottom and self.rect.bottom > platform.bottom:
                    self.rect.top = platform.bottom
                    self.velocity_y = 0
        
        # Limites de l'écran
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > 800:
            self.rect.right = 800
    
    def draw(self, screen):
        pygame.draw.rect(screen, self.color, self.rect)
        # Dessiner un symbole simple pour Kahina
        pygame.draw.circle(screen, (255, 255, 255), 
                          (self.rect.centerx, self.rect.centery - 10), 8)
