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
  | "program"
  | "gift"
  | "footer";

const sectionOrder: SectionKey[] = [
  "hero",
  "countdown",
  "details",
  "program",
  "gift",
  "footer",
];

const publicAssets = {
  heroBackground: "/bg.png",
  detailBorder: "/border.png",
  programCake: "/cake.png",
} as const;

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
    filter: isVisible ? "blur(0px)" : "blur(10px)",
    transition: `opacity 900ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 900ms cubic-bezier(0.22, 0.61, 0.36, 1), filter 900ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
    transitionDelay: `${index * 120}ms`,
    willChange: "opacity, transform, filter",
  };
};

const Invitation = () => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft());
  const [visibleSections, setVisibleSections] = useState<
    Record<SectionKey, boolean>
  >({
    hero: true,
    countdown: false,
    details: false,
    program: false,
    gift: false,
    footer: false,
  });
  const sectionRefs = useRef<Record<SectionKey, HTMLElement | null>>({
    hero: null,
    countdown: null,
    details: null,
    program: null,
    gift: null,
    footer: null,
  });

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

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Quattrocento:wght@400;700&display=swap"
        rel="stylesheet"
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
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
            filter: blur(0px);
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
        }
      `}</style>

      <div style={styles.page}>
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
            <div style={styles.heroOverlay}></div>
            <div
              style={{
                ...styles.heroContent,
                ...getRevealStyles("hero", visibleSections, 1, true),
              }}
            >
              <p style={styles.heroSubtitle}>Nous nous marions</p>
              <h1 style={styles.coupleNames}>Hichem &amp; Oumayma</h1>
              <p style={styles.heroSubtitle}> AUGUST 1, 2026, 6:00 PM</p>
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
                compte à rebours
              </h2>
              <div style={styles.countdownGrid} className="countdown-grid">
                {[
                  { label: "jours", value: timeLeft.days },
                  { label: "heures", value: timeLeft.hours },
                  { label: "minutes", value: timeLeft.minutes },
                  { label: "secondes", value: timeLeft.seconds },
                ].map((item, index) => (
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
                  </div>
                ))}
              </div>
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
              Details
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
                <span style={styles.detailLabel}>Lieu</span>
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
                  Secret Garden
                  <br />
                  Dar Bouraoui
                </a>
              </div>

              <div
                style={{
                  ...styles.detailCardRow,
                  ...getRevealStyles("details", visibleSections, 4),
                }}
              >
                <span style={styles.detailLabel}>Date</span>
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
                  August 1, 2026
                  <br />
                  De 6:00 PM A 9:00 PM
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
                ...getRevealStyles("program", visibleSections, 1),
              }}
            >
              Program
            </h2>

            <div style={styles.programSectionWrapper}>
              <div
                style={{
                  ...styles.programImageWrapper,
                  ...getRevealStyles("program", visibleSections, 2),
                }}
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
              >
                {[
                  { time: "5:00 PM", title: "Welcome Photos & Cocktails" },
                  { time: "6:00 PM", title: "Dinner Program" },
                  { time: "7:00 PM", title: "Toasts & Speeches" },
                  { time: "8:00 PM", title: "Official Picture Taking" },
                  { time: "9:00 PM", title: "Open Bar & Dancing" },
                ].map((item, index, list) => (
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
                Soyez présents à notre mariage, c'est le plus beau cadeau que
                vous puissiez nous faire!
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
              © 2026 Hichem &amp; Oumayma • All rights reserved
            </p>
          </footer>
        </main>
      </div>
    </>
  );
};

const styles: Record<string, CSSProperties> = {
  page: {
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
    backgroundImage: `url('${publicAssets.heroBackground}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
    padding: "120px 40px",
    maxWidth: "1200px",
    margin: "0 auto",
    borderBottom: "1px solid #e8dcd8",
  },
  sectionHeading: {
    fontFamily: "'Quattrocento', serif",
    fontSize: "3.5rem",
    fontWeight: "300",
    color: "#3d2f2a",
    marginBottom: "55px",
    textAlign: "center",
    textTransform: "uppercase",
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
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginTop: "24px",
    maxWidth: "640px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  countdownItem: {
    padding: "20px 12px",
    backgroundColor: "#fffaf7",
    border: "1px solid #e8dcd8",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(90, 74, 71, 0.06)",
  },
  countdownValue: {
    fontFamily: "'Roboto Mono', monospace",
    fontSize: "clamp(1.5rem, 3vw, 2.3rem)",
    fontWeight: "600",
    color: "#3d2f2a",
    marginBottom: "6px",
  },
  countdownLabel: {
    fontSize: "0.8rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#8b7a72",
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
  },
  programDetails: {
    borderRadius: "28px",
    padding: "32px 28px",
    display: "grid",
    gap: "16px",
  },
  programDetailRow: {
    display: "grid",
    gridTemplateColumns: "96px 1fr",
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
    padding: "40px 26px 30px",
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
};

export default Invitation;
