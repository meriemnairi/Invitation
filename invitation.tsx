import { useEffect, useRef, useState, type CSSProperties } from "react";

const weddingDate = new Date("2026-08-01T18:00:00");

const getTimeLeft = () => {
  const difference = weddingDate.getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

type SectionKey =
  | "hero"
  | "countdown"
  | "details"
  | "photo"
  | "program"
  | "gift"
  | "footer";

const sectionOrder: SectionKey[] = [
  "hero",
  "countdown",
  "photo",
  "details",
  "program",
  "gift",
  "footer",
];

const publicAssets = {
  heroBackground: "/bg.png",
  detailBorder: "/border.png",
  programCake: "/cake.png",
  handsPhoto: "/hands.jpg",
} as const;

const themeAccent = "#6a8e6a";

const animationConfig = {
  duration: 900,
  easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
} as const;

type Language = "en" | "fr";

const translations = {
  en: {
    heroSubtitle: "We are getting married",
    heroDate: "AUGUST 1, 2026, 6:00 PM",
    countdownHeading: "Countdown",
    countdownLabels: ["days", "hours", "minutes", "seconds"],
    detailsHeading: "Details",
    locationLabel: "Location",
    dateLabel: "Date",
    locationTitle: "Secret Garden",
    locationSubtitle: "Dar Bouraoui",
    dateText: ["August 1, 2026", "From 6:00 PM to 9:00 PM"],
    programHeading: "Program",
    programItems: [
      { time: "18:00", title: "accueil des invités" },
      { time: "18:30", title: "cérémonie de la fatiha & AQd" },
      { time: "19:30", title: "Dancing and ezat sweets (dhyafa)" },
      { time: "20:30", title: "séance photos avec les mariés" },
    ],
    giftText:
      "Be present at our wedding, it is the most beautiful gift you can give us!",
    footerText: "© 2026 Hichem & Oumayma • All rights reserved",
    muteLabel: "Mute music",
    unmuteLabel: "Unmute music",
    languageLabel: "Language",
  },
  fr: {
    heroSubtitle: "Nous nous marions",
    heroDate: "1 AOÛT 2026, 18:00",
    countdownHeading: "Compte à rebours",
    countdownLabels: ["jours", "heures", "minutes", "secondes"],
    detailsHeading: "Détails",
    locationLabel: "Lieu",
    dateLabel: "Date",
    locationTitle: "Secret Garden",
    locationSubtitle: "Dar Bouraoui",
    dateText: ["1 août 2026", "De 18:00 à 21:00"],
    programHeading: "Déroulé de la journée",
    programItems: [
      { time: "18:00", title: "accueil des invités" },
      { time: "18:30", title: "cérémonie de la fatiha & AQd" },
      { time: "19:30", title: "Dancing and ezat sweets (dhyafa)" },
      { time: "20:30", title: "séance photos avec les mariés" },
    ],
    giftText:
      "Soyez présents à notre mariage, c'est le plus beau cadeau que vous puissiez nous faire !",
    footerText: "© 2026 Hichem & Oumayma • Tous droits réservés",
    muteLabel: "Couper le son",
    unmuteLabel: "Réactiver le son",
    languageLabel: "Langue",
  },
} as const;

const getHeroBackgroundStyle = (stage: number): CSSProperties => ({
  filter: stage >= 1 ? "blur(0px)" : "blur(16px)",
  opacity: stage >= 1 ? 1 : 0.92,
  transition: `filter 1300ms ${animationConfig.easing}, opacity 1300ms ${animationConfig.easing}`,
});

const getHeroPartStyle = (
  stage: number,
  currentStage: number,
  delay = 0,
): CSSProperties => ({
  opacity: currentStage >= stage ? 1 : 0,
  transform:
    currentStage >= stage
      ? "translateY(0) scale(1)"
      : "translateY(28px) scale(0.96)",
  filter: currentStage >= stage ? "blur(0px)" : "blur(10px)",
  transition: `opacity 550ms ${animationConfig.easing} ${delay}ms, transform 550ms ${animationConfig.easing} ${delay}ms, filter 550ms ${animationConfig.easing} ${delay}ms`,
  willChange: "opacity, transform, filter",
});

const getRevealStyles = (
  section: SectionKey,
  visibleSections: Record<SectionKey, boolean>,
  index = 0,
  initialVisible = false,
): CSSProperties => {
  const isVisible = initialVisible || visibleSections[section];

  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? "translateY(0) rotate(0deg) scale(1)"
      : "translateY(56px) rotate(-4deg) scale(0.94)",
    filter: isVisible ? "blur(0px)" : "blur(12px)",
    transition: `opacity ${animationConfig.duration}ms ${animationConfig.easing}, transform ${animationConfig.duration}ms ${animationConfig.easing}, filter ${animationConfig.duration}ms ${animationConfig.easing}`,
    transitionDelay: `${index * 120}ms`,
    animation: isVisible
      ? `artReveal ${animationConfig.duration}ms ${animationConfig.easing} both`
      : undefined,
    animationDelay: isVisible ? `${index * 120}ms` : undefined,
    willChange: "opacity, transform, filter",
  };
};

const Invitation = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft());
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState<Language>("fr");
  const currentCopy = translations[language];
  const [visibleSections, setVisibleSections] = useState<
    Record<SectionKey, boolean>
  >({
    hero: true,
    countdown: false,
    details: false,
    photo: false,
    program: false,
    gift: false,
    footer: false,
  });
  const [heroStage, setHeroStage] = useState(0);
  const sectionRefs = useRef<Record<SectionKey, HTMLElement | null>>({
    hero: null,
    countdown: null,
    details: null,
    photo: null,
    program: null,
    gift: null,
    footer: null,
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target.getAttribute(
            "data-section",
          ) as SectionKey | null;
          if (section && entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [section]: true }));
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -80px 0px",
      },
    );

    sectionOrder.forEach((section) => {
      const node = sectionRefs.current[section];
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setHeroStage(1), 250),
      window.setTimeout(() => setHeroStage(2), 700),
      window.setTimeout(() => setHeroStage(3), 1120),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isMuted;

    const tryPlay = async () => {
      try {
        audio.volume = 0.25;
        await audio.play();
      } catch {
        // Autoplay may be blocked until the user interacts with the page.
      }
    };

    const handleInteraction = () => {
      void tryPlay();
    };

    void tryPlay();

    window.addEventListener("pointerdown", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Quattrocento:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <audio
        ref={audioRef}
        src="/music.mp3"
        autoPlay
        loop
        preload="auto"
        style={{ display: "none" }}
      />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width: 100%; }

        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        @keyframes artReveal {
          from {
            opacity: 0;
            transform: translateY(56px) rotate(-4deg) scale(0.94);
            filter: blur(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
            filter: blur(0px);
          }
        }

        @keyframes heroPulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.01);
            filter: brightness(1.05);
          }
        }

        @keyframes floatLift {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Quattrocento:wght@300;400;700&display=swap');
        
        @media (max-width: 768px) {
          .section-hero { padding: 40px 20px !important; }
          .section { padding: 40px 20px !important; }
          .program-grid { grid-template-columns: 1fr !important; }
          .details-grid { grid-template-columns: 1fr !important; }
          .countdown-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .rsvp-container { padding: 30px 20px !important; }
          .hero-section { min-height: 500px !important; }
          .program-section-wrapper {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .program-image-wrapper {
            order: -1 !important;
            justify-content: center !important;
          }
          .program-image {
            max-width: 320px !important;
          }
          .program-details {
            padding: 0 !important;
          }
          .couple-names {
            white-space: nowrap !important;
            font-size: clamp(2.2rem, 9vw, 4.2rem) !important;
          }
        }
      `}</style>

      <div style={styles.page}>
        <div style={styles.controls}>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={
              isMuted ? currentCopy.unmuteLabel : currentCopy.muteLabel
            }
            style={styles.muteButton}
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" style={styles.icon} aria-hidden="true">
                <path
                  d="M4 9.5v5h3.5l4.5 3.5V6L7.5 9.5H4Zm11.4 1.2 1.2-1.2-1.2-1.2 1.2-1.2 1.2 1.2 1.2-1.2 1.2 1.2-1.2 1.2 1.2 1.2-1.2 1.2-1.2-1.2-1.2 1.2-1.2-1.2Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" style={styles.icon} aria-hidden="true">
                <path
                  d="M4 9.5v5h3.5l4.5 3.5V6L7.5 9.5H4Zm9.3 0.7a3.9 3.9 0 0 1 0 4.6 1.1 1.1 0 0 0 1.8 1.2 5.9 5.9 0 0 0 0-7.1 1.1 1.1 0 0 0-1.8 1.2Zm2.2-2.3a8.1 8.1 0 0 1 0 10.2 1.1 1.1 0 0 0 1.8 1.2 10.2 10.2 0 0 0 0-12.7 1.1 1.1 0 0 0-1.8 1.2Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
          <div
            role="group"
            aria-label={currentCopy.languageLabel}
            style={styles.languageSwitcher}
          >
            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              style={{
                ...styles.languageOption,
                ...(language === "en" ? styles.languageOptionActive : {}),
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("fr")}
              aria-pressed={language === "fr"}
              style={{
                ...styles.languageOption,
                ...(language === "fr" ? styles.languageOptionActive : {}),
              }}
            >
              FR
            </button>
          </div>
        </div>
        <main>
          {/* Hero Section with Background Image */}
          <section
            ref={(node) => {
              sectionRefs.current.hero = node;
            }}
            data-section="hero"
            style={{
              ...styles.heroSection,
              ...getRevealStyles("hero", visibleSections, 0, true),
            }}
            className="section-hero hero-section"
          >
            <div
              style={{
                ...styles.heroBackground,
                ...getHeroBackgroundStyle(heroStage),
              }}
            />
            <div style={styles.heroOverlay}></div>
            <div style={styles.heroContent}>
              <p
                style={{
                  ...styles.heroSubtitle,
                  ...getHeroPartStyle(1, heroStage),
                }}
              >
                {currentCopy.heroSubtitle}
              </p>
              <h1
                style={{
                  ...styles.coupleNames,
                  ...getHeroPartStyle(2, heroStage, 120),
                }}
                className="couple-names"
              >
                Hichem &amp; Oumayma
              </h1>
              <p
                style={{
                  ...styles.heroSubtitle,
                  ...getHeroPartStyle(3, heroStage, 240),
                }}
              >
                {currentCopy.heroDate}
              </p>
              {/* <div style={styles.heroFooter}>
                <span style={styles.heroFooterText}>
                  AUGUST 1, 2026, 6:00 PM
                </span>
                <span style={styles.heroFooterText}>
                  THE SUNROOM AT RIZAL GARDENS
                </span>
              </div> */}
            </div>
          </section>

          {/* Countdown Section */}
          <section
            ref={(node) => {
              sectionRefs.current.countdown = node;
            }}
            data-section="countdown"
            style={{
              ...styles.section,
              ...getRevealStyles("countdown", visibleSections, 0),
            }}
          >
            <div
              style={{
                ...styles.storyContainer,
                ...getRevealStyles("countdown", visibleSections, 1),
              }}
            >
              <h2
                style={{
                  ...styles.sectionHeading,
                  ...getRevealStyles("countdown", visibleSections, 2),
                }}
              >
                {currentCopy.countdownHeading}
              </h2>
              <div style={styles.countdownGrid} className="countdown-grid">
                {[
                  {
                    label: currentCopy.countdownLabels[0],
                    value: timeLeft.days,
                  },
                  {
                    label: currentCopy.countdownLabels[1],
                    value: timeLeft.hours,
                  },
                  {
                    label: currentCopy.countdownLabels[2],
                    value: timeLeft.minutes,
                  },
                  {
                    label: currentCopy.countdownLabels[3],
                    value: timeLeft.seconds,
                  },
                ].flatMap((item, index, list) => {
                  const elements = [
                    <div
                      key={item.label}
                      style={{
                        ...styles.countdownItem,
                        ...getRevealStyles(
                          "countdown",
                          visibleSections,
                          3 + index,
                        ),
                      }}
                    >
                      <div style={styles.countdownValue}>
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div style={styles.countdownLabel}>{item.label}</div>
                    </div>,
                  ];

                  if (index < list.length - 1) {
                    elements.push(
                      <div
                        key={`${item.label}-sep`}
                        style={styles.countdownSeparator}
                      >
                        :
                      </div>,
                    );
                  }

                  return elements;
                })}
              </div>
            </div>
          </section>

          {/* Photo Section */}
          <section
            ref={(node) => {
              sectionRefs.current.photo = node;
            }}
            data-section="photo"
            style={{
              ...styles.photoSection,
              ...getRevealStyles("photo", visibleSections, 0),
            }}
          >
            <div style={styles.photoOverlay}>
              <img
                src={publicAssets.handsPhoto}
                alt="Hands photo"
                style={styles.photoImage}
              />
              <div style={styles.photoShade} />
            </div>
          </section>

          {/* Details Section */}
          <section
            ref={(node) => {
              sectionRefs.current.details = node;
            }}
            data-section="details"
            style={{
              ...styles.section,
              ...getRevealStyles("details", visibleSections, 0),
            }}
          >
            <h2
              style={{
                ...styles.sectionHeading,
                ...getRevealStyles("details", visibleSections, 1),
              }}
            >
              {currentCopy.detailsHeading}
            </h2>
            <div
              style={{
                ...styles.detailFrame,
                ...getRevealStyles("details", visibleSections, 2),
              }}
            >
              <div
                style={{
                  ...styles.detailCardRow,
                  marginTop: "25px",
                  ...getRevealStyles("details", visibleSections, 3),
                }}
              >
                <span style={styles.detailLabel}>
                  {currentCopy.locationLabel}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  style={styles.detailIcon}
                  aria-hidden="true"
                >
                  <path
                    d="M12 2.5C8.962 2.5 6.5 4.96 6.5 8c0 4.66 5.5 11.23 5.5 11.23S17.5 12.66 17.5 8c0-3.04-2.46-5.5-5.5-5.5Zm0 7.75a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z"
                    fill="currentColor"
                  />
                </svg>
                <a
                  href="https://www.google.com/maps/place/Dar+Bouraoui+Carthage/@36.8615973,10.3132932,16z/data=!3m1!4b1!4m6!3m5!1s0x12e2b5fe656929fd:0x3129acb730236568!8m2!3d36.861593!4d10.3158681!16s%2Fg%2F11fqtwc768?entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.detailLink}
                >
                  {currentCopy.locationTitle}
                  <br />
                  {currentCopy.locationSubtitle}
                </a>
              </div>

              <div
                style={{
                  ...styles.detailCardRow,
                  ...getRevealStyles("details", visibleSections, 4),
                }}
              >
                <span style={styles.detailLabel}>{currentCopy.dateLabel}</span>
                <svg
                  viewBox="0 0 24 24"
                  style={styles.detailIcon}
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 7.5v4.5l3 1.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span style={styles.detailText}>
                  {currentCopy.dateText[0]}
                  <br />
                  {currentCopy.dateText[1]}
                </span>
              </div>
            </div>
          </section>

          {/* Program Section */}
          <section
            ref={(node) => {
              sectionRefs.current.program = node;
            }}
            data-section="program"
            style={{
              ...styles.section,
              ...getRevealStyles("program", visibleSections, 0),
            }}
          >
            <h2
              style={{
                ...styles.sectionHeading,
                marginBottom: "24px",
                ...getRevealStyles("program", visibleSections, 1),
              }}
            >
              {currentCopy.programHeading}
            </h2>

            <div
              style={styles.programSectionWrapper}
              className="program-section-wrapper"
            >
              <div
                style={{
                  ...styles.programImageWrapper,
                  ...getRevealStyles("program", visibleSections, 2),
                }}
                className="program-image-wrapper"
              >
                <img
                  src={publicAssets.programCake}
                  alt="Cake"
                  style={styles.programImage}
                />
              </div>

              <div
                style={{
                  ...styles.programDetails,
                  ...getRevealStyles("program", visibleSections, 3),
                }}
                className="program-details"
              >
                {currentCopy.programItems.map((item, index, list) => (
                  <div
                    key={item.time}
                    style={{
                      ...styles.programDetailRow,
                      ...getRevealStyles("program", visibleSections, 4 + index),
                    }}
                  >
                    <span style={styles.programTime}>{item.time}</span>
                    <span style={styles.programTitle}>{item.title}</span>
                    {index < list.length - 1 && (
                      <div style={styles.programDivider}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gift Registry Section */}
          <section
            ref={(node) => {
              sectionRefs.current.gift = node;
            }}
            data-section="gift"
            style={{
              ...styles.section,
              ...getRevealStyles("gift", visibleSections, 0),
            }}
          >
            <div
              style={{
                ...styles.giftContainer,
                ...getRevealStyles("gift", visibleSections, 1),
              }}
            >
              <p
                style={{
                  ...styles.presenceText,
                  ...getRevealStyles("gift", visibleSections, 2),
                }}
              >
                {currentCopy.giftText}
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer
            ref={(node) => {
              sectionRefs.current.footer = node;
            }}
            data-section="footer"
            style={{
              ...styles.footer,
              ...getRevealStyles("footer", visibleSections, 0),
            }}
          >
            <p
              style={{
                ...styles.footerText,
                ...getRevealStyles("footer", visibleSections, 1),
              }}
            >
              {currentCopy.footerText}
            </p>
          </footer>
        </main>
      </div>
    </>
  );
};

const styles: Record<string, CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#5a4a47",
    backgroundColor: "#f5ede8",
    width: "100%",
  },
  heroSection: {
    position: "relative",
    width: "100%",
    minHeight: "720px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    animation: "heroPulse 18s ease-in-out infinite",
  },
  heroBackground: {
    position: "absolute",
    inset: 0,
    backgroundImage: `url('${publicAssets.heroBackground}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: 1,
    willChange: "filter, opacity",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    backdropFilter: "blur(1px)",
  },
  heroContent: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    textAlign: "center",
    width: "100%",
    height: "100%",
    padding: "80px 40px",
    justifyContent: "space-between",
  },
  rsvpButton: {
    padding: "10px 32px",
    backgroundColor: "transparent",
    color: "rgba(255, 255, 255, 0.9)",
    border: "2px solid rgba(255, 255, 255, 0.7)",
    borderRadius: "2px",
    fontSize: "0.75rem",
    fontWeight: "600",
    letterSpacing: "0.15em",
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "all 0.3s ease",
  },
  coupleNames: {
    fontFamily: "'Pinyon Script', cursive",
    fontSize: "clamp(3rem, 8vw, 5.5rem)",
    fontWeight: "400",
    color: "white",
    margin: "0",
    letterSpacing: "0.05em",
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  heroSubtitle: {
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "400",
    letterSpacing: "0.15em",
    margin: "0",
    textTransform: "uppercase",
    textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
  },
  heroFooter: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "700px",
    paddingTop: "20px",
  },
  heroFooterText: {
    fontSize: "0.8rem",
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: "300",
    fontFamily: "'Roboto Mono', monospace",
  },

  section: {
    padding: "90px 40px",
    maxWidth: "1200px",
    margin: "0 auto",
    borderBottom: "1px solid #e8dcd8",
  },
  sectionHeading: {
    fontFamily: "'Quattrocento', serif",
    fontSize: "3.2rem",
    fontWeight: "300",
    color: "#3d2f2a",
    marginBottom: "38px",
    textAlign: "center",
    textTransform: "uppercase",
  },
  photoSection: {
    width: "100%",
    padding: "0",
    margin: "0 auto",
    overflow: "hidden",
    backgroundColor: "#efe1da31",
  },
  photoOverlay: {
    position: "relative",
    width: "100%",
    height: "520px",
    overflow: "hidden",
    backgroundColor: "rgba(60, 35, 25, 0.18)",
  },
  photoShade: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(80, 50, 35, 0.26) 0%, rgba(40, 24, 14, 0.60) 100%)",
    pointerEvents: "none",
    zIndex: 1,
  },
  photoImage: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    filter: "brightness(0.66) contrast(1.08)",
    position: "absolute",
    inset: 0,
    zIndex: 0,
  },

  storyContainer: {
    maxWidth: "700px",
    margin: "0 auto",
    textAlign: "center",
  },
  storySubtitle: {
    fontSize: "1rem",
    color: "#8b7a72",
    marginBottom: "20px",
    fontStyle: "italic",
    fontFamily: "'Roboto Mono', monospace",
  },
  storyText: {
    fontSize: "0.95rem",
    lineHeight: "1.7",
    color: "#6a5a52",
    fontFamily: "'Roboto Mono', monospace",
  },
  countdownGrid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px 6px",
    marginTop: "24px",
    maxWidth: "720px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  countdownItem: {
    padding: "10px 6px",
    minWidth: "76px",
    display: "grid",
    gap: "4px",
    textAlign: "center",
  },
  countdownValue: {
    fontFamily: "'Roboto Mono', monospace",
    fontSize: "clamp(1.4rem, 3vw, 2rem)",
    fontWeight: "600",
    color: "#3d2f2a",
    marginBottom: "4px",
  },
  countdownLabel: {
    fontSize: "0.78rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: themeAccent,
    fontWeight: 600,
  },
  countdownSeparator: {
    fontSize: "1.2rem",
    color: themeAccent,
    fontWeight: 700,
    alignSelf: "baseline",
    lineHeight: 1,
    margin: "20px 4px 0",
  },

  programSectionWrapper: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 1fr) minmax(360px, 1.15fr)",
    gap: "32px",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "1020px",
    margin: "0 auto",
  },
  programImageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  programImage: {
    width: "100%",
    maxWidth: "460px",
    height: "auto",
    borderRadius: "28px",
    objectFit: "cover",
    animation: "floatLift 8s ease-in-out infinite",
    willChange: "transform",
  },
  programDetails: {
    borderRadius: "28px",
    padding: "28px 24px",
    display: "grid",
    gap: "14px",
  },
  programDetailRow: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: "18px",
    alignItems: "center",
  },
  programTime: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#7f6b5f",
    fontFamily: "'Roboto Mono', monospace",
  },
  programTitle: {
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: "#4d4039",
    fontFamily: "'Roboto Mono', monospace",
  },
  programDivider: {
    gridColumn: "2 / -1",
    height: "1px",
    background: "none",
    borderBottom: "1px dashed rgba(116, 97, 79, 0.35)",
    marginTop: "8px",
  },

  detailSectionWrapper: {
    display: "none",
  },
  detailFrame: {
    width: "100%",
    maxWidth: "360px",
    margin: "0 auto",
    padding: "32px 24px 24px",
    backgroundImage: `url('${publicAssets.detailBorder}')`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    borderRadius: "30px",
    minHeight: "400px",
    display: "grid",
    alignItems: "start",
    gap: "8px",
    backgroundColor: "transparent",
  },
  detailCard: {
    width: "100%",
    padding: "0",
    backgroundColor: "transparent",
    borderRadius: "0",
    border: "none",
    display: "grid",
    gap: "0",
    textAlign: "center",
  },
  detailCardRow: {
    display: "grid",
    gap: "3px",
    alignItems: "center",
    justifyItems: "center",
  },
  detailLabel: {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "8px",
    color: "#3d2f2a",
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    fontFamily: "'Quattrocento', serif",
    justifySelf: "center",
  },
  detailText: {
    fontSize: "0.95rem",
    lineHeight: "1.75",
    color: "#5a4a47",
    fontFamily: "'Roboto Mono', monospace",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    textAlign: "center",
  },
  detailIcon: {
    color: "#8a9479",
    width: "1.3rem",
    height: "1.3rem",
    flexShrink: 0,
  },
  detailLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    color: "#5a4a47",
    textDecoration: "none",
    fontFamily: "'Roboto Mono', monospace",
    fontWeight: 500,
    paddingBottom: "2px",
    textAlign: "center",
    lineHeight: 1.4,
  },
  divider: {
    width: "100%",
    height: "1px",
    backgroundColor: "rgba(90, 74, 71, 0.08)",
  },

  giftContainer: {
    maxWidth: "700px",
    margin: "0 auto",
    textAlign: "center",
  },
  giftText: {
    fontSize: "0.95rem",
    lineHeight: "1.7",
    color: "#6a5a52",
    marginBottom: "20px",
    fontFamily: "'Roboto Mono', monospace",
  },
  presenceText: {
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#5a4a47",
    fontStyle: "italic",
    fontFamily: "'Roboto Mono', monospace",
  },

  contactSection: {
    padding: "60px 40px",
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center",
    borderBottom: "1px solid #e8dcd8",
  },
  contactInfo: {
    fontSize: "0.95rem",
    color: "#5a4a47",
    marginBottom: "10px",
    fontFamily: "'Roboto Mono', monospace",
  },

  footer: {
    padding: "30px 40px",
    textAlign: "center",
    backgroundColor: "#f5ede8",
    borderTop: "1px solid #e8dcd8",
  },
  footerText: {
    fontSize: "0.85rem",
    color: "#8b7a72",
  },
  controls: {
    position: "fixed",
    right: "16px",
    bottom: "16px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  languageSwitcher: {
    display: "flex",
    gap: "4px",
    padding: "4px",
    borderRadius: "999px",
    backgroundColor: "rgba(255, 250, 247, 0.28)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 6px 18px rgba(90, 74, 71, 0.06)",
  },
  languageOption: {
    border: "none",
    borderRadius: "999px",
    padding: "4px 8px",
    backgroundColor: "transparent",
    color: "rgba(90, 74, 71, 0.78)",
    cursor: "pointer",
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    transition: "all 180ms ease",
  },
  languageOptionActive: {
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    color: "#5a4a47",
    border: "1px solid rgba(90, 74, 71, 0.2)",
    boxShadow: "0 2px 8px rgba(90, 74, 71, 0.08)",
  },
  muteButton: {
    border: "1px solid rgba(90, 74, 71, 0.14)",
    borderRadius: "999px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 250, 247, 0.32)",
    backdropFilter: "blur(12px)",
    color: "rgba(90, 74, 71, 0.9)",
    cursor: "pointer",
    fontSize: "1rem",
    padding: 0,
    boxShadow: "0 6px 18px rgba(90, 74, 71, 0.06)",
    transition: "transform 180ms ease, background-color 180ms ease",
  },
  icon: {
    width: "18px",
    height: "18px",
    display: "block",
  },
};

export default Invitation;
