class VisionSystem:
    def __init__(self):
        self.active = False
        self.cooldown = 0
        self.max_cooldown = 180  # 3 secondes à 60 FPS
        self.duration = 0
        self.max_duration = 120  # 2 secondes à 60 FPS
    
    def toggle_vision(self):
        if not self.active and self.cooldown <= 0:
            self.active = True
            self.duration = self.max_duration
        elif self.active:
            self.active = False
            self.cooldown = self.max_cooldown
    
    def update(self):
        if self.active:
            self.duration -= 1
            if self.duration <= 0:
                self.active = False
                self.cooldown = self.max_cooldown
        else:
            if self.cooldown > 0:
                self.cooldown -= 1
