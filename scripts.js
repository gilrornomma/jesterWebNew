
        // Global variables for our Jester particles
        let particles = [];
        let numParticles = 69; // double 69, heh, nice.
        let particleColor;
        let colorIndex = 0;
        let diamondColors = ['#323233', '#2d2d2e', '#2b2b2c', '#272728', '#242424', '#29292a'];
        let diamondGrid;
        let colorChangeInterval = 5000; // 5 seconds between color changes
        let lastColorChangeTime = 0;
        let glowGraphic;
        let neonColors 

        function setup() {
            let canvasHeight = windowHeight * 0.66; // 60% of the viewport height
            let canvasWidth = windowWidth * 0.99; // 60% of the viewport height
            let canvas = createCanvas(canvasWidth, canvasHeight);
            canvas.parent('canvas-container');
            canvas.style('z-index', '5');
            pixelDensity(1)
            logoArea = {
                x: windowWidth / 2 - 125, // Centered, half-width to the left
                y: windowHeight / 2 - 50,  // Adjust this value as needed for the vertical position
                w: 250,                    // Width of the logo area
                h: 100                     // Height of the logo area
            };
            noStroke();
            neonColors = [
                color(255, 0, 255), // Neon Pink
                color(0, 255, 255), // Neon Cyan
                color(255, 255, 0), // Neon Yellow
                color(0, 255, 0),   // Neon Green
                color(255, 165, 0), // Neon Orange
                color(255, 0, 0),   // Neon Red
                color(0, 255, 127), // Neon Spring Green
                color(255, 20, 147), // Neon Deep Pink
                color(0, 191, 255), // Neon Deep Sky Blue
                color(180, 0, 255), // Neon Purple
                color(255, 105, 180), // Neon Hot Pink
                color(132, 255, 0)  // Neon Chartreuse
                ];
            // Create Jester particles and initialize them
            for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
            }
            particleColor = color(242, 242, 235);

            // Create and prepare a pre-rendered glow effect only once
                glowGraphic = createGraphics(80, 80); // Adjust size as needed
                glowGraphic.pixelDensity(1); // Handle high-DPI displays
                glowGraphic.noStroke();
                glowGraphic.fill(255, 255, 255, 100); // White with some transparency
                glowGraphic.ellipse(glowGraphic.width / 2, glowGraphic.height / 2, 50); // Draw a white circle
                glowGraphic.filter(BLUR, 10); // Blur the circle to create a glow effect
                
                //diamond grid
                diamondGrid = createDiamondGrid();
                diamondBuffer = createGraphics(width, height);
                diamondGrid.forEach(diamond => {
                diamond.color = color(random(diamondColors));
                diamond.targetColor = color(random(diamondColors));
                diamond.changeTime = millis();
                diamond.changeDuration = random(2000, 5000); // between 2 and 5 seconds
            });
        }

        function draw() {
            let currentTime = millis();
            background(0);
            
            // Draw the glow behind the logo
            push();
            translate(logoArea.x + logoArea.w / 2, logoArea.y + logoArea.h / 2); // Adjust position as needed
            tint(255, 100); // Adjust glow color and intensity as needed
            imageMode(CENTER);
            image(glowGraphic, 0, 0, logoArea.w * 1.5, logoArea.h * 1.5); // Adjust size as needed
            noTint();
            pop();

            diamondBuffer.clear();
            // Draw the diamond grid
            diamondGrid.forEach(drawDiamond);
            image(diamondBuffer, 0, 0);
            // Check and resolve collisions
            checkParticlesCollision();

            // Update and display particles
            particles.forEach((particle) => {
                particle.update();
                particle.edges();
                particle.display();
            });
            if (easterEggCanvas) {
        easterEggCanvas.background(255, 255, 255, 0); // Transparent background



        // Update and display emojis on the easter egg canvas
        for (let i = emojis.length - 1; i >= 0; i--) {
        emojis[i].update();
        emojis[i].display();
        if (emojis[i].isOffScreen()) {
            emojis.splice(i, 1);
        }
        }

        // Draw the easter egg canvas on top of the main canvas
        drawEasterEgg();
    }
    }


        function createDiamondGrid() {
            let grid = [];
            // The width of the diamond at its widest point
            let diamondWidth = 50;
            // The height of the diamond
            let diamondHeight = diamondWidth;

            // Determine the horizontal and vertical spacing
            let horizontalSpacing = diamondWidth;
            let verticalSpacing = diamondHeight;

            for (let x = 0; x < width + diamondWidth; x += horizontalSpacing) {
                for (let y = 0; y < height + diamondHeight; y += verticalSpacing) {
                    // Stagger every other row by half the width of the diamond
                    let staggerOffsetX = (Math.floor(y / verticalSpacing) % 2) * (diamondWidth / 2);
                    staggerOffsetX = Math.round(staggerOffsetX); // Round to the nearest pixel to align properly
                    let posX = Math.round(x + staggerOffsetX);
                    let posY = Math.round(y);

                    grid.push({
                        x: posX,
                        y: posY,
                        size: diamondWidth+1,
                        color: color(random(diamondColors)),
                        targetColor: color(random(diamondColors)),
                        changeTime: millis(),
                        changeDuration: random(2000, 5000)
                    });
                }
            }
            return grid;
        }

        function drawDiamond(diamond) {
            let elapsed = millis() - diamond.changeTime;
            let t = map(elapsed, 0, diamond.changeDuration, 0, 1);
            t = constrain(t, 0, 1);

            if (t >= 1) {
                diamond.color = diamond.targetColor;
                diamond.targetColor = color(random(diamondColors));
                diamond.changeTime = millis();
                // Reset the timer and pick a new target color
                t = 0;
            }

            // Interpolate between the current color and the target color
            let displayColor = lerpColor(diamond.color, diamond.targetColor, t);

            // Draw the diamond on the graphics buffer
            diamondBuffer.fill(displayColor);
            diamondBuffer.noStroke();
            diamondBuffer.push();
            diamondBuffer.translate(diamond.x, diamond.y);
            diamondBuffer.beginShape();
            diamondBuffer.vertex(0, -diamond.size); // Top vertex
            diamondBuffer.vertex(diamond.size / 2, 0); // Right vertex
            diamondBuffer.vertex(0, diamond.size); // Bottom vertex
            diamondBuffer.vertex(-diamond.size / 2, 0); // Left vertex
            diamondBuffer.endShape(CLOSE);
            diamondBuffer.pop();
        }

        // Function to check for collisions between all particles
        function checkParticlesCollision() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                particles[i].checkCollision(particles[j]);
                }
            }
        }

        // Change particle color randomly on mouse press, I thought of maybe doing just our brand colors but we can change it
        function mousePressed() {
                // Change the glow color for all particles when the mouse is pressed
                let newGlowColor = random(neonColors);
                particles.forEach(particle => {
                particle.glowColor = newGlowColor;
            });
        }

        // Toggle particle following behavior with the 'J' key (because J for Jester boyyyyyy)
        function keyPressed() {
        if (key === 'j' || key === 'J') {
            particles.forEach(particle => {
            particle.following = !particle.following;
            });
        }
        }

        // Resize canvas on window resize cuz ya neva know
        function windowResized() {
            let newCanvasHeight = windowHeight * 0.66; // 60% of the viewport height
            resizeCanvas(windowWidth, newCanvasHeight); // Resize the canvas
            pixelDensity(1); // Consider setting pixelDensity if needed after resizing
            
            // Update the logo area dimensions if they are based on canvas size
            logoArea = {
                x: windowWidth / 2 - 125, // Centered, half-width to the left
                y: newCanvasHeight / 2 - 50, // Adjust this value as needed for the vertical position
                w: 250, // Width of the logo area
                h: 100  // Height of the logo area
            };

            // Update particle positions and other properties if needed
            particles.forEach(particle => {
                particle.position = createVector(random(width), random(height));
                // Update other properties if they are dependent on canvas size
            });

            // Recreate the glow effect with new dimensions
            glowGraphic = createGraphics(80, 80); // May need to adjust size if needed
            glowGraphic.pixelDensity(1);
            glowGraphic.noStroke();
            glowGraphic.fill(255, 255, 255, 100);
            glowGraphic.ellipse(glowGraphic.width / 2, glowGraphic.height / 2, 50);
            glowGraphic.filter(BLUR, 10);

            // Rebuild the diamond grid
            diamondGrid = createDiamondGrid();
            diamondBuffer = createGraphics(width, newCanvasHeight); // Create a graphics buffer with new size
            diamondGrid.forEach(diamond => {
                diamond.color = color(random(diamondColors));
                diamond.targetColor = color(random(diamondColors));
                diamond.changeTime = millis();
                diamond.changeDuration = random(2000, 5000);
            });
        }

        class Particle {
            constructor() {
                this.position = createVector(random(width), random(height));
                this.velocity = createVector(random(-2, 2), random(-2, 2));
                this.size = random(8, 25);
                this.maxSpeed = 5;
                this.following = false;
                this.glowColor = color(255, 100);
            }
            
            update() {
                this.steerAwayFromNavbar();

                if (this.following) {
                this.followMouse();
                } else {
                this.position.add(this.velocity);
                }
                this.avoidMouse();
            }

            drawGlow() {
                push();
                translate(this.position.x, this.position.y);
                tint(this.glowColor); // Use the particle's glowColor
                imageMode(CENTER);
                image(glowGraphic, 0, 0, this.size * 3, this.size * 3);
                noTint();
                pop();
            }

            steerAwayFromNavbar() {
                const navbarHeight = 150; // The fixed height of your navbar
                const buffer = 15; // How close the particles can get to the navbar

                // If the particle's vertical position is less than the navbarHeight plus the buffer, create a downward repulsion force
                if (this.position.y < navbarHeight + buffer) {
                    // Repulsion force directed downward
                    let repulsion = createVector(0, this.maxSpeed);
                    // Apply the repulsion force to the particle's velocity
                    this.velocity.lerp(repulsion, 0.1);
                }
            }
            followMouse() {
                let target = createVector(mouseX, mouseY);
                let force = p5.Vector.sub(target, this.position);
                force.normalize();
                force.mult(0.5);
                this.velocity.lerp(force, 0.2);
                this.position.add(this.velocity);
            }

            avoidMouse() {
                let mouse = createVector(mouseX, mouseY);
                let dir = p5.Vector.sub(this.position, mouse);
                let d = dir.mag();
                if (d < 50) {
                dir.setMag(this.maxSpeed);
                this.velocity.lerp(dir, 0.2);
                } else {
                this.velocity.lerp(createVector(random(-2, 2), random(-2, 2)), 0.05);
                }
                this.position.add(this.velocity);
            }

            checkCollision(other) {
                let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
                let sizeSum = (this.size / 2 * 1.5) + (other.size / 2 * 1.5);
                if (d < sizeSum) {
                let overlap = sizeSum - d;
                let correctionVector = p5.Vector.sub(this.position, other.position).normalize().mult(overlap / 2);
                this.position.add(correctionVector);
                other.position.sub(correctionVector);

                let thisToOther = p5.Vector.sub(other.position, this.position).normalize();
                let otherToThis = p5.Vector.sub(this.position, other.position).normalize();
                let adjustmentStrength = 0.5;
                this.velocity.lerp(otherToThis, adjustmentStrength * (overlap / sizeSum));
                other.velocity.lerp(thisToOther, adjustmentStrength * (overlap / sizeSum));
                }
            }

            edges() {
                if (this.position.x < 0 || this.position.x > width) {
                this.velocity.x *= -1;
                }
                if (this.position.y < 0 || this.position.y > height) {
                this.velocity.y *= -1;
                }
            }

            display() {
                fill(particleColor);
                let halfWidth = this.size / 2;
                let halfHeight = this.size / 2 * 1.5;
                this.drawGlow();
                noStroke();

                push();
                translate(this.position.x, this.position.y);
                beginShape();
                vertex(0, -halfHeight);
                vertex(halfWidth, 0);
                vertex(0, halfHeight);
                vertex(-halfWidth, 0);
                endShape(CLOSE);

                rotate(PI / 2);
                beginShape();
                vertex(0, -halfHeight);
                vertex(halfWidth, 0);
                vertex(0, halfHeight);
                vertex(-halfWidth, 0);
                endShape(CLOSE);
                pop();
            }
        }

        window.addEventListener('scroll', function() {
        var nav = document.querySelector('nav');
        if (window.scrollY > window.innerHeight * 0.1) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });


    function switchHeadline() {
        // First remove 'active' class from all headlines
        headlines.forEach((headline) => {
            headline.classList.remove('active');
            headline.style.position = 'absolute'; // Keeps the inactive headlines out of the flow
        });

        // Then add 'active' class to the next headline
        currentHeadline = (currentHeadline + 1) % headlines.length;
        headlines[currentHeadline].classList.add('active');
        headlines[currentHeadline].style.position = 'relative'; // Brings the active headline into the flow
    }


    document.addEventListener('DOMContentLoaded', () => {
        const hamburger = document.querySelector('.hamburger-menu');
        const menuContainer = document.querySelector('.menu-container');

        hamburger.addEventListener('click', () => {
            // This toggles the active class on the menu container
            if (window.innerWidth < 768) { // Adjust the pixel value to your mobile breakpoint
                menuContainer.classList.toggle('active');
                hamburger.classList.toggle('is-active');
            }
        });
    });

    window.twttr = (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
        if (d.getElementById(id)) return t;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);

        t._e = [];
        t.ready = function(f) {
            t._e.push(f);
        };

        return t;
    }(document, "script", "twitter-wjs"));

    // When Twitter widget is ready, apply additional settings if needed
    twttr.ready(function(twttr) {
        twttr.events.bind('rendered', function(event) {
            // Adjust iframe styles or attributes here if necessary
            var iframe = event.target;
            var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            // Apply styles to elements inside iframe, for example:
            // iframeDocument.querySelector('.timeline-Tweet-text').style.fontSize = '12px';
        });
    });

let easterEggCanvas;
let emojis = [];
let emojiCount = 0;
const maxEmojiCount = 69; // Maximum number of emojis to create
let emojiGravity = 0.1;
let emojiSymbol = '🃏';

function startEasterEgg() {
  // Determine the button's position on the page
  const launchAppButton = document.getElementById('launch-app');
  const buttonRect = launchAppButton.getBoundingClientRect();
  const buttonCenterX = buttonRect.left + buttonRect.width * 0.5;
  const buttonCenterY = buttonRect.top + buttonRect.height * 0.5 + window.scrollY;

  // Create a new overlay canvas for the easter egg
  easterEggCanvas = createGraphics(windowWidth, windowHeight);
  easterEggCanvas.textSize(26);

  drawEasterEgg = () => {
    easterEggCanvas.clear(); // Clear the canvas for transparency

    // Add a new emoji based on frameCount and if we have not reached the max emoji count
    if (emojiCount < maxEmojiCount && frameCount % 8 === 0) {
      emojis.push(new Emoji(mouseX, mouseY, emojiSymbol));
      emojiCount++;
    }

    // Update and display emojis
    for (let i = emojis.length - 1; i >= 0; i--) {
      emojis[i].update();
      emojis[i].display();
      if (emojis[i].isOffScreen()) {
        emojis.splice(i, 1); // Remove emoji if it's off-screen
      }
    }

    image(easterEggCanvas, 0, 0);
  };
}

    function stopEasterEgg() {
        emojis = [];
        drawEasterEgg = () => {};
        emojiCount = 0; // Reset emoji count
        easterEggCanvas.remove(); // Remove the canvas
       }

    class Emoji {
        constructor(x, y, symbol) {
            this.position = createVector(x, y);
            this.velocity = createVector(0, random(2, 5));
            this.acceleration = createVector(0, emojiGravity);
            this.symbol = symbol;
        }

        update() {
            this.velocity.add(this.acceleration);
            this.position.add(this.velocity);
        }

        display() {
            easterEggCanvas.text(this.symbol, this.position.x, this.position.y);
        }

        isOffScreen() {
            return (this.position.y > windowHeight);
        }
    }

let drawEasterEgg = () => {};

    document.addEventListener('DOMContentLoaded', () => {
    const launchAppLink = document.getElementById('launch-app');
    let clickCount = 0; // Counter for clicks

    launchAppLink.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent the default link action

        clickCount++; // Increment click count

        // Check if the button has been clicked three times
        if (clickCount === 3) {
        // Reset click count
        clickCount = 0;

        // Start the easter egg
        startEasterEgg();

        // Set a timer to stop the easter egg after 5 seconds
        setTimeout(stopEasterEgg, 6000);

        } else if (clickCount === 2) {
        // Fade out the text for the first click
        launchAppLink.style.opacity = '0';

        // Wait for the fade-out to finish, then change the text and fade it back in
        setTimeout(() => {
            launchAppLink.textContent = '🃏🃏🃏🃏🃏🃏';
            launchAppLink.style.opacity = '1';
        }, 1000); // This timeout duration should match the CSS transition duration
        } else {
        // Fade out the text for the second click
        launchAppLink.style.opacity = '0';

        // Wait for the fade-out to finish, then change the text back to "Coming Soon" and fade it back in
        setTimeout(() => {
            launchAppLink.textContent = 'Coming Soon';
            launchAppLink.style.opacity = '1';
        }, 1000); // This timeout duration should match the CSS transition duration
        }
    });
    });

    //BOT IMAGES
    document.addEventListener('DOMContentLoaded', () => {
        const buttons = document.querySelectorAll('.headlineButton');
    const animationData = {
        botButton: {
        imgId: 'botImg',
        initialSrc: 'img/bot.png',
        enterSrc: 'img/bot-animation.gif',
        exitSrc: 'img/bot-reverse.gif',
        },
        joinPublicButton: {
        imgId: 'joinPublicImg',
        initialSrc: 'img/tg.png',
        enterSrc: 'img/PUBLIC_ON_HOVER.gif',
        exitSrc: 'img/PUBLIC_ON_EXIT.gif',
        },
        vipButton: {
        imgId: 'vipImg',
        initialSrc: 'img/vip.png',
        enterSrc: 'img/VIP_ON_HOVER.gif',
        exitSrc: 'img/VIP_ON_EXIT.gif',
        }
    };
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
        const image = button.closest('.image-container').querySelector('.headline-image');
        if (image) {
            image.style.borderRadius = '50px';
        }
        });

        button.addEventListener('mouseout', () => {
        const image = button.closest('.image-container').querySelector('.headline-image');
        if (image) {
            image.style.borderRadius = '0';
        }
        });
    });



    buttons.forEach(button => {
        const { imgId, initialSrc, enterSrc, exitSrc } = animationData[button.id];
        const img = document.getElementById(imgId);

        button.addEventListener('mouseover', () => {
        img.style.borderRadius = '50px';
        img.src = enterSrc;
        setTimeout(() => {
            img.src = exitSrc;
            setTimeout(() => {
            img.style.borderRadius = '0';
            img.src = initialSrc;
            }, 2000); // Duration of the exit animation
        }, 2000); // Duration of the enter animation
        });
    });
    });

    function toggleInfo(infoId) {
        var info = document.getElementById(infoId);
        info.classList.toggle('active');
    }
    function toggleInfo(infoId) {
        var info = document.getElementById(infoId);
        var title = info.previousElementSibling.querySelector('.tool-title');
        info.classList.toggle('active');
        title.classList.toggle('active'); // Toggle the active class for the arrow rotation
      }