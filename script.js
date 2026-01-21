// 3D Heart Particles JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    let scale = 0.5;
    let animationProgress = 0;
    let animationComplete = false;
    
    // Resize canvas
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        generateHeart();
    }
    
    // Generate heart shape points using parametric equations
    function generateHeart() {
        particles = [];
        
        // Main heart particles - evenly distributed (outer layer)
        const outerParticles = 3500;
        for (let i = 0; i < outerParticles; i++) {
            const t = (i / outerParticles) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            
            // Deeper 3D space with controlled randomness
            const z = (Math.random() - 0.5) * 40;
            
            // Small random offsets for organic feel
            const offsetX = (Math.random() - 0.5) * 2;
            const offsetY = (Math.random() - 0.5) * 2;
            
            // Start position: from below the screen (flying up)
            const startX = (Math.random() - 0.5) * width * 2;
            const startY = height + Math.random() * height;
            const startZ = (Math.random() - 0.5) * 200;
            
            particles.push({
                x: x * 40 + offsetX,
                y: y * 40 + offsetY,
                z: z,
                originalX: x * 40,
                originalY: y * 40,
                originalZ: z,
                startX: startX,
                startY: startY,
                startZ: startZ,
                size: Math.random() * 0.8 + 0.7,
                brightness: Math.random() * 0.3 + 0.7,
                flickerSpeed: Math.random() * 0.1 + 0.05,
                flickerPhase: Math.random() * Math.PI * 2
            });
        }
        
        // Inner glow particles - evenly distributed for 3D depth effect
        const innerParticles = 1200;
        for (let i = 0; i < innerParticles; i++) {
            const t = (i / innerParticles) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            
            // Radial layers for even distribution in center - expanded outward
            const radiusLayer = i % 15;
            const layerScale = (0.4 + (radiusLayer / 15) * 0.6);
            
            // Center area with lighter z values
            const z = (Math.random() - 0.5) * 15;
            
            // Start position: from below the screen (flying up)
            const startX = (Math.random() - 0.5) * width * 2;
            const startY = height + Math.random() * height;
            const startZ = (Math.random() - 0.5) * 200;
            
            particles.push({
                x: x * 40 * layerScale,
                y: y * 40 * layerScale,
                z: z,
                originalX: x * 40 * layerScale,
                originalY: y * 40 * layerScale,
                originalZ: z,
                startX: startX,
                startY: startY,
                startZ: startZ,
                size: Math.random() * 0.5 + 1.2,
                brightness: Math.random() * 0.3 + 0.85,
                flickerSpeed: Math.random() * 0.12 + 0.08,
                flickerPhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    // Easing function for smooth animation
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // Draw particles
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);
        
        // Update animation progress
        if (!animationComplete) {
            animationProgress += 0.008;
            if (animationProgress >= 1) {
                animationProgress = 1;
                animationComplete = true;
            }
        }
        
        const easedProgress = easeOutCubic(animationProgress);
        
        // Transform and sort particles by depth
        const transformedParticles = particles.map((particle) => {
            // Interpolate from start position to target position
            let currentX, currentY, currentZ;
            
            if (animationComplete) {
                currentX = particle.originalX * scale;
                currentY = particle.originalY * scale;
                currentZ = particle.originalZ * scale;
            } else {
                currentX = particle.startX + (particle.originalX * scale - particle.startX) * easedProgress;
                currentY = particle.startY + (particle.originalY * scale - particle.startY) * easedProgress;
                currentZ = particle.startZ + (particle.originalZ * scale - particle.startZ) * easedProgress;
            }
            
            // No rotation - heart stays fixed
            return {
                x: currentX,
                y: currentY,
                z: currentZ,
                originalBrightness: particle.brightness
            };
        });
        
        // Sort by z for proper rendering order
        transformedParticles.sort((a, b) => b.z - a.z);
        
        // Center of canvas
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Draw particles
        transformedParticles.forEach(particle => {
            const perspective = 400 / (400 + particle.z);
            const screenX = centerX + particle.x * perspective;
            const screenY = centerY + particle.y * perspective;
            const size = 1 * perspective;
            
            // Calculate alpha based on depth
            const alpha = Math.min(1, (particle.z + 15) / 30 * particle.originalBrightness + 0.3);
            
            // Draw glow
            const gradient = ctx.createRadialGradient(
                screenX, screenY, 0,
                screenX, screenY, size * 2
            );
            
            const depth = (particle.z + 15) / 30;
            const lightness = 45 + depth * 25;
            const color = `hsla(350, 100%, ${lightness}%,`;
            
            gradient.addColorStop(0, `${color} ${alpha})`);
            gradient.addColorStop(0.4, `${color} ${alpha * 0.5})`);
            gradient.addColorStop(1, `${color} 0)`);
            
            ctx.beginPath();
            ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Draw core
            ctx.beginPath();
            ctx.arc(screenX, screenY, size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ff1744';
            ctx.fill();
        });
        
        requestAnimationFrame(draw);
    }
    
    // Scroll to zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        scale += e.deltaY * -0.001;
        scale = Math.max(0.5, Math.min(3, scale));
    });
    
    // Window resize
    window.addEventListener('resize', resize);
    
    // Initialize
    resize();
    draw();
});
