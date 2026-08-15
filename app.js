/* ==========================================================================
    Md. Rokibul Hasan - Portfolio Interactions
    Engine: Canvas Particle System, Typewriter, Modals, & Image Galleries
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================================================
     0. Theme Toggle (Dark / Light Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const THEME_KEY = "rokibul-theme";

  // Apply saved preference on load (before any paint flicker)
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-mode");
      localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
    });
  }

  /* ==========================================================================
     1. Typewriter Animation (Hero Subtitle)
     ========================================================================== */
  const typewriterElement = document.getElementById("typewriter");
  const titles = [
    "Naval Architect",
    "Marine Engineer",
    "CFD & FEA Specialist",
    "Parametric Designer"
  ];
  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function handleTypewriter() {
    const currentTitle = titles[titleIndex];
    
    if (isDeleting) {
      typewriterElement.textContent = currentTitle.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Faster delete speed
    } else {
      typewriterElement.textContent = currentTitle.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 150; // Standard typing speed
    }

    // Determine state changes
    if (!isDeleting && charIndex === currentTitle.length) {
      typingSpeed = 1500; // Pause at full word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(handleTypewriter, typingSpeed);
  }

  if (typewriterElement) {
    handleTypewriter();
  }

  /* ==========================================================================
     2. Interactive Blueprint Canvas (Particle Grid) — ENHANCED
     ========================================================================== */
  const canvas = document.getElementById("blueprint-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    const mouse = {
      x: null,
      y: null,
      radius: 150
    };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    function getThemeColor(alpha) {
      const isLight = document.body.classList.contains("light-mode");
      if (isLight) {
        const boostedAlpha = Math.min(1.0, alpha * 2.2);
        return `rgba(18, 24, 38, ${boostedAlpha})`;
      } else {
        const boostedAlpha = Math.min(1.0, alpha * 1.35);
        return `rgba(0, 229, 255, ${boostedAlpha})`;
      }
    }

    // Skill badges attraction targets (CFD, FSI, FEM, CAD, ML)
    let orbitTargets = [];

    function updateOrbitTargets() {
      orbitTargets = [];
      const coordEls = document.querySelectorAll(".profile-coord");
      coordEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.top >= -100 && rect.bottom <= window.innerHeight + 100) {
          orbitTargets.push({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          });
        }
      });
    }

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 20;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.baseSize = Math.random() * 1.8 + 0.8;
        this.pulseAngle = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.025 + 0.012;
        this.opacity = Math.random() * 0.5 + 0.25;
        this.speed = Math.random() * 0.5 + 0.2;
      }

      draw() {
        this.pulseAngle += this.pulseSpeed;
        const pulse = (Math.sin(this.pulseAngle) + 1) * 0.5;
        const currentSize = this.baseSize + pulse * 0.9;
        const alpha = this.opacity * (0.5 + pulse * 0.5);

        // Outer glow halo ring
        ctx.fillStyle = getThemeColor(alpha * 0.25);
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 2.4, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // Solid core dot
        ctx.fillStyle = getThemeColor(alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update(targets) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Gentle attraction toward orbiting skill tags (CFD, FSI, FEM, CAD, ML)
        if (targets && targets.length > 0) {
          const attractRadius = 200;
          for (let i = 0; i < targets.length; i++) {
            let target = targets[i];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < attractRadius && distance > 10) {
              let force = (attractRadius - distance) / attractRadius;
              let angle = Math.atan2(dy, dx);
              // Subtle magnetic pull toward tag
              this.x += Math.cos(angle) * force * 0.95;
              this.y += Math.sin(angle) * force * 0.95;
            }
          }
        }

        // Mouse repulsion
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            let angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 2.5;
            this.y -= Math.sin(angle) * force * 2.5;
          }
        }
      }
    }

    function initParticles() {
      particles = [];
      // Fewer particles on touch/mobile devices for smooth 60fps
      const isMobile = window.matchMedia("(max-width: 768px)").matches || navigator.maxTouchPoints > 0;
      const density  = isMobile ? 28000 : 10000;
      const cap      = isMobile ? 40    : 110;
      let particleCount = Math.min(Math.floor((canvas.width * canvas.height) / density), cap);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles(targets) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160;
          if (distance < maxDist) {
            const alpha = (1 - distance / maxDist) * 0.22;
            ctx.strokeStyle = getThemeColor(alpha);
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Connect particles to nearby orbiting skill badges
        if (targets && targets.length > 0) {
          for (let k = 0; k < targets.length; k++) {
            let target = targets[k];
            let dx = target.x - particles[i].x;
            let dy = target.y - particles[i].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 150;
            if (distance < maxDist) {
              const alpha = (1 - distance / maxDist) * 0.38;
              ctx.strokeStyle = getThemeColor(alpha);
              ctx.lineWidth = 0.75;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(target.x, target.y);
              ctx.stroke();
            }
          }
        }

        // Mouse connections
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - particles[i].x;
          let dy = mouse.y - particles[i].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;
          if (distance < maxDist) {
            const alpha = (1 - distance / maxDist) * 0.35;
            ctx.strokeStyle = getThemeColor(alpha);
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateOrbitTargets();

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(orbitTargets);
        particles[i].draw();
      }
      connectParticles(orbitTargets);
      requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener("mouseout", () => {
      mouse.x = null;
      mouse.y = null;
    });

    resizeCanvas();
    animate();
  }



  /* ==========================================================================
     2c. Scroll Reveal — IntersectionObserver Engine
     ========================================================================== */
  function initScrollReveal() {
    // Mark standalone reveal elements
    document.querySelectorAll(".section-header, .about-bio, .about-focus-grid, .focus-card, .project-card, .tool-card, .timeline-col, .pub-card, .contact-form-wrapper, .contact-info-block").forEach(el => {
      if (!el.classList.contains("reveal") && !el.classList.contains("reveal-stagger")) {
        el.classList.add("reveal");
      }
    });

    // Mark grid containers for stagger
    document.querySelectorAll(".focus-grid, .projects-grid, .tools-grid, .publications-grid").forEach(grid => {
      grid.classList.add("reveal-stagger");
    });

    // Observer for individual .reveal elements
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          // Trigger title underline sweep on section headers
          if (entry.target.classList.contains("section-header")) {
            entry.target.classList.add("visible");
          }
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

    // Observer for stagger grids
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    document.querySelectorAll(".reveal-stagger").forEach(el => staggerObserver.observe(el));
  }


  /* ==========================================================================
     3. Scroll Mechanics (Progress Bar, Header Shrink, Active Nav Items)
     ========================================================================== */
  const progressBar = document.getElementById("scroll-progress");
  const header = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");

  window.addEventListener("scroll", () => {
    // Scroll progress bar
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (winScroll / height) * 100;
    if (progressBar) {
      progressBar.style.setProperty("--scroll-progress", `${scrolled}%`);
    }

    // Shrink header
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Highlight current section in nav link
    let currentSectionId = "";
    sections.forEach((section) => {
      let sectionTop = section.offsetTop;
      if (pageYOffset >= sectionTop - 120) {
        currentSectionId = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
  });

  /* ==========================================================================
     4. Mobile Navigation Menu Toggle
     ========================================================================== */
  const navToggle = document.querySelector(".mobile-nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active");
      mainNav.classList.toggle("active");
    });

    // Close menu when clicking links
    document.querySelectorAll(".main-nav a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("active");
        mainNav.classList.remove("active");
      });
    });
  }

  /* ==========================================================================
     5. Skill progress bars intersecting animation
     ========================================================================== */
  const skillsSection = document.getElementById("skills");
  const progressBars = document.querySelectorAll(".progress-bar");

  if (skillsSection && progressBars.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          progressBars.forEach((bar) => {
            let widthValue = bar.getAttribute("data-width");
            bar.style.width = widthValue;
          });
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, { threshold: 0.15 });

    observer.observe(skillsSection);
  }

  /* ==========================================================================
     6. Dynamic Case Study Modals & Galleries
     ========================================================================== */
  const modalBackdrop = document.getElementById("project-modal");
  const modalContent = document.getElementById("modal-dynamic-content");
  const modalCloseBtn = document.querySelector(".modal-close-btn");

  // Database of Rokibul's project details
  const projectsData = {
    thesis: {
      title: "Numerical & Parametric Investigation of Fore Geometry Impact in Collision",
      category: "Thesis & Finite Element Analysis (FEA)",
      images: [
        "./assets/images/thesis/thesis (1).png",
        "./assets/images/thesis/thesis (2).png",
        "./assets/images/thesis/thesis (3).png"
      ],
      imageNames: [
        "Pristine Mesh: Striking Ship Forecastle & Struck Side Structure",
        "Collision Stress Contours: Maximum Penetration & Deformation",
        "Energy Absorption Plot: Plastic Strain Energy vs Penetration Depth"
      ],
      description: `
        <h3 class="modal-section-title">Project Scope & Core Parameters</h3>
        <p>This academic B.Sc. thesis evaluates the impact performance and crashworthiness of ship structures during crossing collision scenarios. The study focuses specifically on optimizing the forecastle bulwark geometry of a striking ship to minimize penetration damage on the struck vessel.</p>
        
        <h3 class="modal-section-title">Methods & Analytical Workflows</h3>
        <ul>
          <li><strong>CAD Modeling & Geometry Variations:</strong> Modeled different variations of the forecastle bulwark and bow shapes using Rhinoceros 3D.</li>
          <li><strong>Explicit Non-linear FEA:</strong> Set up boundary conditions, mesh controls, and contact algorithms in ANSYS Mechanical and LS-Dyna. Modeled high-energy impact loading.</li>
          <li><strong>Energy Dissipation Assessment:</strong> Computed internal energy, plastic strains, and reaction forces during the step-by-step collision sequence.</li>
        </ul>
 
        <h3 class="modal-section-title">Findings & Results</h3>
        <p>The numerical simulations demonstrated that specific geometric parameters, such as the flare angle and bulwark curvature, significantly influence the collision resistance. Optimizing these shapes successfully delayed structural rupture, distributed the load across a larger contact area, and increased structural energy absorption capacity by over 12%, reducing critical compartment breaches.</p>
 
        <h3 class="modal-section-title">Before/After Structural Collision Comparison</h3>
        <div class="ba-slider-container">
          <img src="./assets/images/thesis/thesis (2).png" alt="After Collision Stress Contours" class="ba-image ba-image-after">
          <div class="ba-slider-overlay">
            <img src="./assets/images/thesis/thesis (1).png" alt="Before Collision Pristine Mesh" class="ba-image ba-image-before">
          </div>
          <input type="range" min="0" max="100" value="50" class="ba-slider-input" aria-label="Before/After Slider Control">
          <div class="ba-slider-line"></div>
          <div class="ba-slider-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="14" height="14">
              <polyline points="8 5 1 12 8 19" stroke="currentColor" stroke-linecap="round"></polyline>
              <polyline points="16 5 23 12 16 19" stroke="currentColor" stroke-linecap="round"></polyline>
            </svg>
          </div>
        </div>
        <div style="text-align: center; margin-top:-0.5rem; margin-bottom:1.5rem; font-size:0.85rem; color:var(--text-muted);">
          ⬅️ Slide horizontally to compare: Pristine Mesh (Left) vs Stress Contours (Right) ➡️
        </div>
      `,
      specs: [
        { label: "Thesis Focus", value: "Forecastle Bulwark Geometry" },
        { label: "Evaluation Solver", value: "Explicit Dynamics (FEA)" },
        { label: "Primary Tools", value: "ANSYS Mechanical & LS-Dyna" },
        { label: "Research Goal", value: "Maximize Energy Absorption" },
        { label: "Key Performance", value: "+12% Collision Resistance" },
        { label: "Vessel Application", value: "Bulk Carrier / General Cargo Bows" }
      ]
    },
    lng: {
      title: "Design & Analysis of a 156,000 m³ Liquified Natural Gas (LNG) Carrier",
      category: "Vessel Design & Stability Analysis",
      images: [
        "./assets/images/lng/LNG (1).jpg",
        "./assets/images/lng/LNG (1).png",
        "./assets/images/lng/LNG (2).png"
      ],
      imageNames: [
        "LNG Carrier profile: 3D Hull Render & Deck Layout",
        "Dual-Hull Containment: Membrane Cargo Tank Internals CAD",
        "Stability Output: Intact & Damage Safety Hydrostatics"
      ],
      description: `
        <h3 class="modal-section-title">Design Scope & Ship Particulars</h3>
        <p>This design project encompasses the complete design spiral development for a modern ocean-going LNG carrier displacing thousands of tonnes. The design integrates membrane cargo containment systems conforming to international IGF and IGC codes.</p>
        
        <h3 class="modal-section-title">Detailed Work Breakdown</h3>
        <ul>
          <li><strong>Hull Particulars & lines Fairing:</strong> Formulated main dimensions (LOA, LBP, Beam, Draft) based on carrying efficiency, and generated fair lines plans using Maxsurf.</li>
          <li><strong>Hydrostatics & Safety Checking:</strong> Calculated cross curves, hydrostatics offsets, compartment layouts, and checked intact and damage stability criteria across loading profiles.</li>
          <li><strong>Resistance & Powering:</strong> Conducted powering estimation using empirical methods (Holtrop & Mennen) to size the main propulsion systems for efficient sea trials.</li>
        </ul>

        <h3 class="modal-section-title">Key Drawings Developed</h3>
        <p>The project produced complete engineering documentation, including a General Arrangement (GA) drawing showing containment layouts and ballast configurations, midship structural drawings showing scantling configurations, and detailed body plans and lines drawings.</p>
      `,
      specs: [
        { label: "Cargo Capacity", value: "156,000 m³" },
        { label: "Layout Type", value: "Double Hull / Membrane Containment" },
        { label: "Calculations", value: "Intact & Damage Stability" },
        { label: "Software Tools", value: "Maxsurf, Rhino, AutoCAD" },
        { label: "Sizing Method", value: "Holtrop & Mennen Resistance" },
        { label: "Classification", value: "IGC and IGF Codes Compliance" }
      ]
    },
    grasshopper: {
      title: "Self-Developed Parametric Engineering Tools in Grasshopper",
      category: "Parametric Design & Algorithm Automation",
      images: [
        "./assets/images/parametric/parametric (1).png",
        "./assets/images/parametric/parametric (2).png",
        "./assets/images/parametric/parametric (3).png"
      ],
      imageNames: [
        "Grasshopper algorithm: Parametric Wind Turbine & Hull Interface",
        "Aerodynamic Design: Wind Turbine Blade Twist Parameters (NACA Airfoil)",
        "Offset Generator: Lines Plan Automation from Excel Datasets"
      ],
      description: `
        <h3 class="modal-section-title">Automation & Parametric Modeling</h3>
        <p>This project highlights custom Grasshopper and RhinoCommon script algorithms designed to eliminate repetitive workflows in ship design and blade aerodynamics modeling.</p>
        
        <h3 class="modal-section-title">Key Tool Implementations</h3>
        <ul>
          <li><strong>Customizable Horizontal Axis Turbine:</strong> Built a Grasshopper parametric layout to model turbine blades, automatically adjusting twist angles, chord distributions, and NACA airfoil shapes based on wind speed parameters.</li>
          <li><strong>Automated Hull Form Generation:</strong> Modeled a parametric script that generates planning and displacement hull shapes dynamically, outputting hydrostatic estimates in real-time.</li>
          <li><strong>Automated Lines Plan & Offset Generator:</strong> An algorithm that imports numeric offset tables and automatically constructs 3D curves, waterlines, buttock lines, and structured drawing plans.</li>
        </ul>
      `,
      specs: [
        { label: "Engine Platform", value: "Grasshopper / Rhino 3D / C#" },
        { label: "Aerodynamics", value: "NACA Airfoil Wind Turbine Blades" },
        { label: "Hull Generation", value: "Parametric Displacement/Planning Hulls" },
        { label: "Offset Importer", value: "Excel Offset to 3D Lines Plan Curves" },
        { label: "Time Saved", value: "Over 85% on Hull Draft Iterations" },
        { label: "Outputs", value: "Cross Sections, Buttocks, Hydrostatics offsets" }
      ]
    },
    spider: {
      title: "Quadruped Obstacle-Detector Spider Robot",
      category: "Mechatronics & Robotics",
      images: [
        "./assets/images/spider/Spider (1).jpg",
        "./assets/images/spider/Spider (1).png",
        "./assets/images/spider/Spider (2).jpg"
      ],
      imageNames: [
        "Obstacle-Detector Spider: Quadruped Locomotion Chassis Model",
        "Inverse Kinematics: Leg joint angles & gait trajectory mapping",
        "Circuitry Setup: Arduino Control Board & SG90 Servo Wiring"
      ],
      description: `
        <h3 class="modal-section-title">Mechatronics & Kinematics Control</h3>
        <p>This mechatronics project involves building and programming a four-legged spider robot capable of navigating complex terrains autonomously while actively avoiding obstacles in its path.</p>
        
        <h3 class="modal-section-title">Development Steps</h3>
        <ul>
          <li><strong>Inverse Kinematics implementation:</strong> Formulated mathematical equations representing joint rotations required to position the spider's feet at specific coordinate offsets, ensuring smooth step transitions.</li>
          <li><strong>Autonomous Path Planning:</strong> Programmed real-time distance scanning. When obstacles are detected within a 20cm range, the controller commands the spider to turn left/right or reverse.</li>
          <li><strong>Gait Optimization:</strong> Developed custom walking, crawling, and turning gaits to optimize locomotion stability on friction-compromised surfaces.</li>
        </ul>
      `,
      specs: [
        { label: "Microcontroller", value: "Arduino Uno" },
        { label: "Gait Control", value: "Analytical Inverse Kinematics" },
        { label: "Range Finder", value: "HC-SR04 Ultrasonic" },
        { label: "Actuation", value: "8x SG90 Micro Servos" },
        { label: "Power Source", value: "7.4V Li-ion Battery" },
        { label: "Navigation Mode", value: "Autonomous Obstacle Avoidance" }
      ]
    },
    firefighting: {
      title: "Arduino-Controlled Automatic Firefighting Robot",
      category: "Electrical & Electronics Lab Project",
      images: [
        "./assets/images/firefighting/FF (1).jpg",
        "./assets/images/firefighting/FF (2).jpg",
        "./assets/images/firefighting/FF (3).jpg"
      ],
      imageNames: [
        "Firefighting Robot: Mobile tracked chassis design layout",
        "Infrared Array: Flame sensor modules schematic and range paths",
        "Water Extinguisher: 5V DC micro-submersible pump installation details"
      ],
      description: `
        <h3 class="modal-section-title">Electrical & Electronics Lab Development</h3>
        <p>Developed during the B.Sc. Electrical and Electronics course lab, this autonomous robotic vehicle is engineered to detect localized flame sources, navigate to them, and trigger an onboard water pump to extinguish them.</p>
        
        <h3 class="modal-section-title">Technical Design Features</h3>
        <ul>
          <li><strong>Flame Detection Array:</strong> Configured a multi-sensor array consisting of flame sensors to detect infra-red light emitted by fire sources, mapping angles of approach.</li>
          <li><strong>Pump Interfacing:</strong> Wired a 5V DC micro-submersible pump through relay driver circuits, isolation protections, and power buses.</li>
          <li><strong>Dual Operational Logic:</strong> Programmed autonomous hunting modes alongside a manual override. The manual mode allows direct control of movement and pump triggering over Bluetooth via a smartphone dashboard application.</li>
        </ul>
      `,
      specs: [
        { label: "Lab Course", value: "EE Lab (NAME Department, B.Sc.)" },
        { label: "Sensor Types", value: "Infra-Red Flame Sensors & IR Receivers" },
        { label: "Extinguishing", value: "5V DC Water Pump & Spray Nozzle" },
        { label: "Override Mode", value: "HC-05 Bluetooth App Connection" },
        { label: "Control Board", value: "Arduino Uno" },
        { label: "Traction", value: "Dual DC Geared Motors & Rubber Tracks" }
      ]
    },
    shipyard: {
      title: "Comprehensive 3D Shipyard Layout & Infrastructure Model",
      category: "Shipyard Infrastructure Design & Modeling",
      images: [
        "./assets/images/shipyard/model.jpg",
        "./assets/images/shipyard/dock.jpg",
        "./assets/images/shipyard/flow.jpg"
      ],
      imageNames: [
        "Shipyard Overview: Complete 3D Industrial Layout",
        "Heavy Infrastructure: Dry dock gate construction & crane rails",
        "Steel Processing Flow: Workshop logistics and flow paths"
      ],
      description: `
        <h3 class="modal-section-title">Design Scope & Modeling Overview</h3>
        <p>This infrastructure design project involves modeling a complete, modern ship assembly facility capable of building vessels up to 160 meters. The design emphasizes crane coverage, dry dock gates, and logical steel flow layouts from fabrication shops to launching slipways.</p>
        
        <h3 class="modal-section-title">Design Features</h3>
        <ul>
          <li><strong>Dry Dock & Launching Ways:</strong> Modeled a high-capacity dry dock system with gates and drainage piping layouts.</li>
          <li><strong>Crane Pathing:</strong> Integrated rail tracks and structural frames for heavy-duty gantry cranes covering the main assembly docks.</li>
          <li><strong>Fabrication Workshops:</strong> Designed steel preparation and sub-assembly workshops arranged for optimal production workflows.</li>
        </ul>
      `,
      specs: [
        { label: "Facility Scope", value: "Complete Industrial Shipyard Layout Grid" },
        { label: "Modeling Focus", value: "Gantry Cranes, Dry Docks, Launching Slipways" },
        { label: "CAD Engines", value: "AutoCAD & Rhinoceros 3D" },
        { label: "Logistics Optimization", value: "Uni-directional Steel Flow Design" },
        { label: "Max Vessel Sizing", value: "Up to 160m LOA Shipbuilding Capability" },
        { label: "Infrastructure", value: "Structural Frames, Piping, Launch Rails" }
      ]
    },
    tugboat: {
      title: "Detailed Harbor Tugboat 3D Surface & Scantling Model",
      category: "Vessel Modeling & Scantlings",
      images: [
        "./assets/images/tugboat/model.jpg",
        "./assets/images/tugboat/scantling.jpg",
        "./assets/images/tugboat/thruster.jpg"
      ],
      imageNames: [
        "ASD Tugboat: Fair 3D Hull curved surface mesh",
        "Midship structural layout: Scantling profiles & transverse frames",
        "Azimuth propulsion recess: Hull aft guard structures model"
      ],
      description: `
        <h3 class="modal-section-title">Design Philosophy & Modeling Details</h3>
        <p>This ship modeling project details a high-performance harbor tugboat. Focus was placed on modeling complex curved hull surfaces, deck machinery, fenders, and Azimuth Stern Drive (ASD) thruster recesses.</p>
        
        <h3 class="modal-section-title">Model Specifications</h3>
        <ul>
          <li><strong>Hull Surface Fairing:</strong> Formed high-smoothness surface curvature meshes for reduced hydrodynamic resistance.</li>
          <li><strong>Superstructure Layout:</strong> Modeled wheelhouse structures optimized for all-around visibility, a necessity in harbor towing work.</li>
          <li><strong>Propulsion Layout:</strong> Integrated azimuth propulsion pods, nozzle shapes, and guard plates under the hull.</li>
        </ul>
      `,
      specs: [
        { label: "Vessel Type", value: "Harbor Tugboat (ASD)" },
        { label: "Model Elements", value: "Hull Surface, Deckhouse, Fendering, Thrusters" },
        { label: "Modeling Engines", value: "Rhinoceros 3D & SolidWorks" },
        { label: "Design Standards", value: "Classification Scantlings Rules (LR/DNV)" },
        { label: "Fairing Metric", value: "Surface Curvature Continuity Analysis" },
        { label: "Machinery Details", value: "Towing Winch, Staple, Bollard Foundations" }
      ]
    },
    he: {
      title: "CFD Analysis of a Shell and Tube Heat Exchanger",
      category: "Computational Fluid Dynamics (CFD)",
      images: [
        "./assets/images/he/HE (1).png",
        "./assets/images/he/HE (2).png",
        "./assets/images/he/HE (3).png"
      ],
      imageNames: [
        "Finite volume grid: Shell and Tube fluid domain meshing",
        "Velocity field streamlines: Baffled flow velocity profiles",
        "Thermal contours: Hot tube-side & cold shell-side heat gradients"
      ],
      description: `
        <h3 class="modal-section-title">Analysis Objectives & Scope</h3>
        <p>This computational engineering project evaluates the thermodynamic and hydrodynamic performance inside a industrial shell and tube heat exchanger. The analysis focuses on optimizing fluid flow distribution, heat transfer rates, and minimizing pressure losses.</p>
        
        <h3 class="modal-section-title">Methodology & Numerical Setup</h3>
        <ul>
          <li><strong>Domain & Structured Meshing:</strong> Modeled the complex fluid domain including baffle plates and tubes in ANSYS DesignModeler. Generated a high-density, boundary-layer refined volume mesh.</li>
          <li><strong>Solver Configuration (ANSYS Fluent):</strong> Set up steady-state, pressure-based solver configurations using k-epsilon turbulence equations. Applied thermal boundary conditions for hot tube-side and cold shell-side fluids.</li>
          <li><strong>Flow & Temperature Fields:</strong> Solved Navier-Stokes and energy conservation equations to extract detailed field variables.</li>
        </ul>

        <h3 class="modal-section-title">Key Insights & Results</h3>
        <p>Visualizing flow path lines and temperature contours revealed localized dead zones and recirculation regions behind baffle plates. Adjusting the baffle spacing successfully enhanced turbulent mixing, increasing the overall heat transfer coefficient by 8.5% while keeping the shell-side pressure drop increase under a critical 5% threshold.</p>
      `,
      specs: [
        { label: "Solver Platform", value: "ANSYS Fluent (CFD)" },
        { label: "Exchanger Type", value: "Shell & Tube (Baffled)" },
        { label: "Grid Elements", value: "Hex-dominant Finite Volumes" },
        { label: "Evaluations", value: "Velocity Paths, Thermal Gradients" },
        { label: "Optimizations", value: "+8.5% Thermal Transfer Efficacy" },
        { label: "Pressure Drop", value: "Restricted within 5% limit" }
      ]
    },
    ferry: {
      title: "Safe & Eco-Efficient Passenger Ferry Design",
      category: "Ship Design & Hull Modeling",
      images: [
        "./assets/images/ferry/model (1).png",
        "./assets/images/ferry/model (2).png",
        "./assets/images/ferry/model (3).png"
      ],
      imageNames: [
        "Competition rendering: General arrangement profile",
        "Hull lines design: Maxsurf fair 3D curved surfaces",
        "Evacuation & structural plans: Internal passenger deck layouts"
      ],
      description: `
        <h3 class="modal-section-title">Design Concept & Competition Goals</h3>
        <p>Developed as a submission for the prestigious World Ferry Design Competition, this vessel concept features a highly optimized hull shape intended for safe, stable, and low-emission passenger transit in coastal waters.</p>
        
        <h3 class="modal-section-title">Engineering Development Steps</h3>
        <ul>
          <li><strong>Hull Shape Fairing & Resistance:</strong> Formulated main parameters and generated fair hull surfaces in Rhinoceros 3D. Conducted parametric hydrodynamic resistance optimization using Maxsurf.</li>
          <li><strong>Stability & Intact Safety:</strong> Modeled compartmental divisions, passenger decks, and tank arrangements to verify strict compliance with international intact stability standards.</li>
          <li><strong>General Arrangements:</strong> Created an ergonomic general layout plan showing passenger seating, evacuation routes, machinery access, and navigation command bridge.</li>
        </ul>
      `,
      specs: [
        { label: "Vessel Type", value: "Passenger Ferry (Coastal)" },
        { label: "Design Entry", value: "World Ferry Design Competition" },
        { label: "Modeling Tools", value: "Rhinoceros 3D & Maxsurf" },
        { label: "Focus Parameters", value: "Eco-efficiency & Stability Safety" },
        { label: "Hull Form", value: "Optimized Displacement Shape" },
        { label: "Compliance", value: "Intact Stability Rules (IMO)" }
      ]
    }
  };

  let galleryImages = [];
  let galleryNames = [];
  let currentImageIdx = 0;
  let galleryInterval = null;

  // Helper function to build modal carousel markup
  function buildCarouselHTML(images, names) {
    if (!images || images.length === 0) return "";
    if (images.length === 1) {
      return `
        <div class="gallery-section">
          <div class="gallery-carousel">
            <div class="gallery-main-image-wrapper">
              <img src="${images[0]}" alt="Project main visual" class="gallery-main-img">
            </div>
            ${names && names[0] ? `<div class="gallery-caption" id="gallery-caption-text">${names[0]}</div>` : ""}
          </div>
        </div>
      `;
    }

    let thumbnailsHTML = images.map((img, idx) => `
      <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
        <img src="${img}" alt="Thumbnail ${idx + 1}">
      </div>
    `).join("");

    return `
      <div class="gallery-section">
        <h3 class="gallery-title">Project Gallery</h3>
        <div class="gallery-carousel">
          <div class="gallery-main-image-wrapper">
            <button class="gallery-arrow gallery-prev" id="btn-gallery-prev" aria-label="Previous image">&#10094;</button>
            <img src="${images[0]}" alt="Main view" class="gallery-main-img" id="gallery-main-viewport">
            <button class="gallery-arrow gallery-next" id="btn-gallery-next" aria-label="Next image">&#10095;</button>
            <div class="gallery-counter" id="gallery-counter-label">1 / ${images.length}</div>
          </div>
          <div class="gallery-caption" id="gallery-caption-text">${names && names[0] ? names[0] : ""}</div>
          <div class="gallery-thumbnails" id="gallery-thumbs-wrapper">
            ${thumbnailsHTML}
          </div>
        </div>
      </div>
    `;
  }

  // Setup slider control event listeners
  function setupGallerySlider(images, names) {
    galleryImages = images;
    galleryNames = names || [];
    currentImageIdx = 0;

    const viewport = document.getElementById("gallery-main-viewport");
    const label = document.getElementById("gallery-counter-label");
    const caption = document.getElementById("gallery-caption-text");
    const thumbsWrapper = document.getElementById("gallery-thumbs-wrapper");
    const prevBtn = document.getElementById("btn-gallery-prev");
    const nextBtn = document.getElementById("btn-gallery-next");

    if (!viewport || !label || !thumbsWrapper) return;

    if (galleryInterval) {
      clearInterval(galleryInterval);
    }

    function navigateToImage(idx) {
      // Loop boundaries
      currentImageIdx = (idx + galleryImages.length) % galleryImages.length;
      
      // Fade out, switch image source, fade in
      viewport.classList.add("fade-out");
      setTimeout(() => {
        viewport.src = galleryImages[currentImageIdx];
        viewport.classList.remove("fade-out");
      }, 100);

      label.textContent = `${currentImageIdx + 1} / ${galleryImages.length}`;
      if (caption && galleryNames[currentImageIdx]) {
        caption.textContent = galleryNames[currentImageIdx];
      }

      // Update thumbnail active states
      thumbsWrapper.querySelectorAll(".gallery-thumb").forEach((thumb, tIdx) => {
        if (tIdx === currentImageIdx) {
          thumb.classList.add("active");
          thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        } else {
          thumb.classList.remove("active");
        }
      });
    }

    // Auto-play interval - change slide & name one after one
    galleryInterval = setInterval(() => {
      navigateToImage(currentImageIdx + 1);
    }, 4000);

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        clearInterval(galleryInterval);
        navigateToImage(currentImageIdx - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        clearInterval(galleryInterval);
        navigateToImage(currentImageIdx + 1);
      });
    }

    thumbsWrapper.addEventListener("click", (e) => {
      let thumb = e.target.closest(".gallery-thumb");
      if (thumb) {
        clearInterval(galleryInterval);
        navigateToImage(parseInt(thumb.getAttribute("data-idx"), 10));
      }
    });
  }

  function initBeforeAfterSliders() {
    document.querySelectorAll(".ba-slider-container").forEach(container => {
      const input = container.querySelector(".ba-slider-input");
      const overlay = container.querySelector(".ba-slider-overlay");
      const line = container.querySelector(".ba-slider-line");
      const button = container.querySelector(".ba-slider-button");
      
      const updateSlider = (value) => {
        overlay.style.width = `${value}%`;
        line.style.left = `${value}%`;
        button.style.left = `${value}%`;
      };
      
      input.addEventListener("input", (e) => {
        updateSlider(e.target.value);
      });
      
      const imageBefore = container.querySelector(".ba-image-before");
      const adjustWidths = () => {
        container.style.setProperty("--container-width", `${container.offsetWidth}px`);
      };
      adjustWidths();
      window.addEventListener("resize", adjustWidths);
      
      // Auto adjust widths when tab switches and container becomes visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            adjustWidths();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(container);
    });
  }

  // Open modal handler
  document.querySelectorAll(".open-modal-btn, .project-overlay").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = trigger.closest(".project-card");
      if (!card) return;
      
      const projectId = card.getAttribute("data-project-id");
      const data = projectsData[projectId];
      
      if (data) {
        // Fetch drive link from links.js
        const driveLink = (typeof portfolioLinks !== 'undefined')
          ? (portfolioLinks.projects[projectId] || portfolioLinks.designs[projectId] || "")
          : "";

        let driveButtonHTML = "";
        if (driveLink) {
          driveButtonHTML = `
            <div class="modal-actions-bar" style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
              <a href="${driveLink}" target="_blank" rel="noopener" class="btn btn-primary btn-modal-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right: 0.5rem; vertical-align: middle;">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-linecap="round"></path>
                  <polyline points="15 3 21 3 21 9" stroke="currentColor" stroke-linecap="round"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-linecap="round"></line>
                </svg>
                <span>View on Google Drive</span>
              </a>
            </div>
          `;
        }

        // Generate Specs HTML Grid
        const specsHTML = data.specs.map(spec => `
          <div class="spec-box">
            <span class="spec-box-label">${spec.label}</span>
            <span class="spec-box-value">${spec.value}</span>
          </div>
        `).join("");

        // Generate Media HTML (Standard Carousel)
        const mediaHTML = buildCarouselHTML(data.images, data.imageNames);

        modalContent.innerHTML = `
          <h2 class="modal-title">${data.title}</h2>
          <span class="modal-subtitle">${data.category}</span>
          
          <!-- Modal Tabs Header -->
          <div class="modal-tabs-header">
            <button class="modal-tab-btn active" data-tab-target="tab-overview">Overview</button>
            <button class="modal-tab-btn" data-tab-target="tab-specs">Technical Specs</button>
            <button class="modal-tab-btn" data-tab-target="tab-gallery">Gallery / Media</button>
          </div>

          <!-- Modal Tabs Content Panels -->
          <div class="modal-tabs-content">
            <!-- Tab 1: Overview -->
            <div id="tab-overview" class="modal-tab-panel active">
              <div class="modal-text-content">
                ${data.description}
              </div>
            </div>

            <!-- Tab 2: Specs -->
            <div id="tab-specs" class="modal-tab-panel">
              <div class="specs-grid" style="margin: 1.5rem 0;">
                ${specsHTML}
              </div>
            </div>

            <!-- Tab 3: Gallery -->
            <div id="tab-gallery" class="modal-tab-panel">
              ${mediaHTML}
            </div>
          </div>

          ${driveButtonHTML}
        `;
        
        // Wire up tab clicking event listeners
        const tabBtns = modalContent.querySelectorAll(".modal-tab-btn");
        const tabPanels = modalContent.querySelectorAll(".modal-tab-panel");
        
        tabBtns.forEach(btn => {
          btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            const targetId = btn.getAttribute("data-tab-target");
            const targetPanel = modalContent.querySelector(`#${targetId}`);
            if (targetPanel) {
              targetPanel.classList.add("active");
            }
          });
        });

        modalBackdrop.classList.add("open");
        document.body.style.overflow = "hidden"; // Prevent background scroll
        
        // Initialize carousel or slider based on contents
        if (projectId === "thesis") {
          initBeforeAfterSliders();
        }
        if (data.images.length > 1) {
          setupGallerySlider(data.images, data.imageNames);
        }
      }
    });
  });

  // Close modal handler
  function closeModal() {
    modalBackdrop.classList.remove("open");
    document.body.style.overflow = ""; // Restore scrolling
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop.classList.contains("open")) {
      closeModal();
    }
  });

  /* ==========================================================================
     7. Copy Email Widget Action
     ========================================================================== */
  const copyBtn = document.getElementById("copy-email-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const emailText = "rokibulhasan9102@gmail.com";
      navigator.clipboard.writeText(emailText).then(() => {
        const textSpan = copyBtn.querySelector(".btn-text");
        const originalText = textSpan.textContent;
        
        textSpan.textContent = "Copied!";
        copyBtn.style.borderColor = "var(--primary)";
        
        setTimeout(() => {
          textSpan.textContent = originalText;
          copyBtn.style.borderColor = "";
        }, 2000);
      }).catch((err) => {
        console.error("Could not copy email text: ", err);
      });
    });
  }

  /* ==========================================================================
     8. Functional Contact Form Handler
     ========================================================================== */
  const contactForm = document.getElementById("contact-form");
  const formFeedback = document.getElementById("form-feedback");

  if (contactForm && formFeedback) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = "<span>Sending...</span>";
      
      const accessKey = (typeof portfolioLinks !== 'undefined') ? portfolioLinks.web3FormsAccessKey : "";
      
      if (accessKey && accessKey !== "your-web3forms-access-key-here") {
        // Collect form data
        const nameVal = document.getElementById("form-name").value;
        const emailVal = document.getElementById("form-email").value;
        const messageVal = document.getElementById("form-message").value;
        
        const payload = {
          access_key: accessKey,
          name: nameVal,
          email: emailVal,
          message: messageVal,
          subject: "New Contact Message from " + nameVal,
          from_name: "Portfolio Contact Form"
        };
        
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        })
        .then(async (response) => {
          let json = await response.json();
          if (response.status == 200) {
            formFeedback.innerHTML = "Message sent successfully! Thank you for reaching out.";
            formFeedback.style.color = "var(--primary)";
            contactForm.reset();
          } else {
            console.log(response);
            formFeedback.innerHTML = json.message || "Something went wrong. Please try again later.";
            formFeedback.style.color = "var(--accent)";
          }
        })
        .catch(error => {
          console.log(error);
          formFeedback.innerHTML = "Network error. Please try again later.";
          formFeedback.style.color = "var(--accent)";
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
          formFeedback.classList.remove("hidden");
          setTimeout(() => {
            formFeedback.classList.add("hidden");
          }, 6000);
        });
      } else {
        // Simulated submission if no valid key is configured
        setTimeout(() => {
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
          
          formFeedback.innerHTML = `Message simulated successfully!<br><small style="opacity:0.85; font-size:0.8rem; display:block; margin-top:0.4rem;">To receive real emails, get a free Access Key at <a href="https://web3forms.com/" target="_blank" rel="noopener" style="text-decoration:underline;color:var(--primary);">web3forms.com</a> and add it to <strong>links.js</strong>.</small>`;
          formFeedback.style.color = "var(--primary)";
          formFeedback.classList.remove("hidden");
          setTimeout(() => {
            formFeedback.classList.add("hidden");
          }, 8000);
        }, 1200);
      }
    });
  }

  /* ==========================================================================
     9. Dynamic Links Loader (from links.js)
     ========================================================================== */
  if (typeof portfolioLinks !== 'undefined') {
    // Resume CV Download Links
    const resumeBtns = [document.getElementById("download-resume-btn"), document.getElementById("floating-cv-btn")];
    resumeBtns.forEach(btn => {
      if (btn && portfolioLinks.resume) {
        btn.href = portfolioLinks.resume;
      }
    });

    // Certifications timeline anchors
    document.querySelectorAll("[data-link-key]").forEach((element) => {
      const keyPath = element.getAttribute("data-link-key").split(".");
      let targetValue = portfolioLinks;
      for (const key of keyPath) {
        if (targetValue) {
          targetValue = targetValue[key];
        }
      }
      if (targetValue && !targetValue.includes("your-")) {
        element.href = targetValue;
        element.classList.add("valid-link");
      } else {
        // Fallback or placeholder behavior
        element.href = "#";
        element.style.opacity = "0.75";
        const isPub = element.getAttribute("data-link-key").startsWith("publications");
        element.title = isPub 
          ? "Publication link placeholder (Edit links.js to customize)" 
          : "Certificate link placeholder (Edit links.js to customize)";
      }
    });
  }

  /* ==========================================================================
     10. Automatic Project Card Thumbnail Cycler
     ========================================================================== */
  function initCardThumbnailCycler() {
    const cards = document.querySelectorAll(".project-card");
    cards.forEach((card, cardIndex) => {
      const projectId = card.getAttribute("data-project-id");
      if (!projectId) return;
      const data = projectsData[projectId];
      if (!data || !data.images || data.images.length <= 1) return;

      const imgElement = card.querySelector(".project-image");
      if (!imgElement) return;

      let currentIdx = 0;
      const cycleInterval = 4500; // change image every 4.5 seconds
      const startDelay = cardIndex * 800; // staggered start delay (wave effect)

      setTimeout(() => {
        setInterval(() => {
          currentIdx = (currentIdx + 1) % data.images.length;
          imgElement.classList.add("fade-out");
          setTimeout(() => {
            imgElement.src = data.images[currentIdx];
            imgElement.classList.remove("fade-out");
          }, 300); // Wait for fade-out to switch source
        }, cycleInterval);
      }, startDelay);
    });
  }



  /* ==========================================================================
     12. Personal Gallery Slideshow Interactivity
     ========================================================================== */
  function initPersonalGallery() {
    const slides = document.querySelectorAll(".pg-slide");
    const dots = document.querySelectorAll(".pg-dot");
    const prevBtn = document.querySelector(".pg-prev");
    const nextBtn = document.querySelector(".pg-next");
    
    if (slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoPlayInterval;

    function goToSlide(index) {
      slides.forEach((slide) => slide.classList.remove("pg-active"));
      dots.forEach((dot) => dot.classList.remove("pg-active-dot"));

      currentIndex = index;
      if (currentIndex < 0) currentIndex = totalSlides - 1;
      if (currentIndex >= totalSlides) currentIndex = 0;

      slides[currentIndex].classList.add("pg-active");
      dots[currentIndex].classList.add("pg-active-dot");
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    // Event Listeners
    nextBtn.addEventListener("click", () => {
      stopAutoPlay();
      nextSlide();
      startAutoPlay();
    });

    prevBtn.addEventListener("click", () => {
      stopAutoPlay();
      prevSlide();
      startAutoPlay();
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        const targetIndex = parseInt(e.target.getAttribute("data-idx"));
        stopAutoPlay();
        goToSlide(targetIndex);
        startAutoPlay();
      });
    });

    // Start auto-play
    startAutoPlay();
  }

  /* ==========================================================================
     Project Category Filtering Engine
     ========================================================================== */
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".projects-grid .project-card");

    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const targetFilter = btn.getAttribute("data-filter");

        projectCards.forEach(card => {
          const category = card.getAttribute("data-category");

          if (targetFilter === "all" || category === targetFilter) {
            card.style.display = "flex";
            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0) scale(1)";
            }, 10);
          } else {
            card.style.opacity = "0";
            card.style.transform = "scale(0.95)";
            setTimeout(() => {
              card.style.display = "none";
            }, 300);
          }
        });
      });
    });
  }

  /* ==========================================================================
     Mouse Spotlight & Section Nav Dots Engine
     ========================================================================== */
  function initMouseSpotlight() {
    const spotlight = document.getElementById("mouse-spotlight");
    if (!spotlight) return;

    window.addEventListener("mousemove", (e) => {
      spotlight.style.opacity = "1";
      spotlight.style.left = e.clientX + "px";
      spotlight.style.top = e.clientY + "px";
    });

    document.addEventListener("mouseleave", () => {
      spotlight.style.opacity = "0";
    });
  }

  /* ==========================================================================
     Profile Photo Hyperdrive Speed Boost
     ========================================================================== */
  function initProfilePhotoBoost() {
    const photoFrame = document.querySelector(".profile-photo-frame");
    const visualWrapper = document.querySelector(".profile-visual-wrapper");

    if (!photoFrame || !visualWrapper) return;

    let boostTimer = null;

    function triggerBoost() {
      visualWrapper.classList.add("boost-active");

      // Visual glitch burst feedback
      const glitchOverlay = document.getElementById("glitch-overlay");
      if (glitchOverlay) {
        glitchOverlay.classList.add("hard-glitch");
        setTimeout(() => glitchOverlay.classList.remove("hard-glitch"), 280);
      }

      if (boostTimer) clearTimeout(boostTimer);

      // Boost stays active for 4.5 seconds per click/tap
      boostTimer = setTimeout(() => {
        visualWrapper.classList.remove("boost-active");
      }, 4500);
    }

    // Works on both mouse click and touch tap
    photoFrame.addEventListener("click", triggerBoost);
    photoFrame.addEventListener("touchend", (e) => {
      e.preventDefault(); // prevent ghost click delay on mobile
      triggerBoost();
    }, { passive: false });
  }

  initCardThumbnailCycler();
  initPersonalGallery();
  initProjectFilters();
  initMouseSpotlight();
  initScrollReveal();
  initProfilePhotoBoost();


  /* Citation Copy Engine */
  const copyBtns = document.querySelectorAll(".copy-citation-btn");
  copyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const citation = btn.getAttribute("data-citation");
      if (citation) {
        navigator.clipboard.writeText(citation).then(() => {
          const span = btn.querySelector("span");
          const originalText = span.textContent;
          span.textContent = "Copied!";
          btn.style.borderColor = "var(--primary)";
          setTimeout(() => {
            span.textContent = originalText;
            btn.style.borderColor = "";
          }, 2000);
        });
      }
    });
  });
});

/* ==========================================================================
   ELECTRONIC GLITCH ENGINE — fires independently of DOMContentLoaded
   ========================================================================== */
(function initGlitchEngine() {
  const overlay    = document.getElementById("glitch-overlay");
  const slices     = [
    document.getElementById("glitch-slice-1"),
    document.getElementById("glitch-slice-2"),
    document.getElementById("glitch-slice-3"),
  ];
  const rgbR       = document.getElementById("glitch-rgb-r");
  const rgbB       = document.getElementById("glitch-rgb-b");
  const flash      = document.getElementById("glitch-flash");

  if (!overlay || !slices[0]) return;

  // ── Helpers ──────────────────────────────────────────────────────────────
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  function trigger(el, durationMs) {
    el.classList.remove("active");
    void el.offsetWidth; // reflow to restart animation
    el.classList.add("active");
    setTimeout(() => el.classList.remove("active"), durationMs + 50);
  }

  // ── Position a slice at a random vertical band ────────────────────────────
  function positionSlice(el) {
    const h = rand(2, 60);                        // band height in px
    const y = rand(0, window.innerHeight - h);    // top offset
    el.style.top    = y + "px";
    el.style.height = h + "px";
  }

  // ── Minor glitch: 1–2 slices + optional RGB shift ────────────────────────
  function minorGlitch() {
    const count = randInt(1, 2);
    for (let i = 0; i < count; i++) {
      const sl = slices[randInt(0, slices.length - 1)];
      positionSlice(sl);
      setTimeout(() => trigger(sl, 160), i * 40);
    }
    // 50% chance of RGB shift
    if (Math.random() > 0.5) {
      setTimeout(() => { trigger(rgbR, 220); trigger(rgbB, 220); }, 30);
    }
  }

  // ── Major glitch: all slices + RGB + flash + hard-glitch class ───────────
  function majorGlitch() {
    slices.forEach((sl, i) => {
      positionSlice(sl);
      setTimeout(() => trigger(sl, 160), i * 35);
    });
    trigger(rgbR, 220);
    trigger(rgbB, 220);
    setTimeout(() => trigger(flash, 120), 60);

    // Full-overlay hue-rotation spasm
    overlay.classList.add("hard-glitch");
    setTimeout(() => overlay.classList.remove("hard-glitch"), 300);
  }

  // ── Rapid-fire burst (3–5 hits in quick succession) ──────────────────────
  function burstGlitch() {
    const hits = randInt(3, 5);
    for (let i = 0; i < hits; i++) {
      setTimeout(minorGlitch, i * rand(60, 120));
    }
  }

  // ── Scheduler: random intervals, weighted towards minor ──────────────────
  function scheduleNext() {
    // Wait 2.5 – 9 seconds between events
    const delay = rand(2500, 9000);

    setTimeout(() => {
      const roll = Math.random();
      if (roll < 0.55)      minorGlitch();   // 55% — subtle flicker
      else if (roll < 0.80) burstGlitch();   // 25% — quick burst
      else if (roll < 0.95) majorGlitch();   // 15% — full spasm
      // 5% miss — nothing fires, natural silence

      scheduleNext();
    }, delay);
  }

  // Kick off after a short settle time so it doesn't fire on page load
  setTimeout(scheduleNext, rand(1500, 3500));
})();
