import { useState, useEffect, useRef } from "react";

const LOGO_SRC = "/logo.png";
const INSTAGRAM_URL = "https://www.instagram.com/nextnobel/";

const STORIES = [
  { id: 1, category: "Entomology", title: "지속가능한 살충제를 설계하는 과학자", author: "윤준호", affiliation: "서울대 응용생물화학부 · 곤충 독성학", excerpt: "25살에 서울대 박사를 수석 졸업한 곤충학자. 살충제 혼합물 속 성분들이 만들어내는 복잡한 상호작용을 이해하여, 더 정밀한 방제 전략을 설계한다. 올 5월, 스웨덴 룬드대학교에서 농약이 화분매개 곤충에 미치는 영향을 연구하러 떠난다.", date: "2026.03.04", readTime: "15min" },
  { id: 2, category: "Condensed Matter", title: "카고메 격자 위에서 양자를 읽다", author: "이준영", affiliation: "서울대 물리천문학부 · Kang Research Group", excerpt: "한국과학영재학교를 거쳐 서울대에서 카고메 금속의 전자 구조를 탐구한다. nanoARPES로 나노미터 단위의 양자 세계를 들여다보며, Nature 급 연구의 공저자로 이름을 올렸다.", date: "2026.02.18", readTime: "12min" },
  { id: 3, category: "Biophysics", title: "2미터의 DNA는 어떻게 핵 속에 들어가는가", author: "이수현", affiliation: "서울대 물리천문학부 · 단분자 생물물리", excerpt: "국제화학올림피아드 은메달리스트가 선택한 길은, 화학이 아닌 생명의 근본이었다. 형광 현미경으로 분자 하나하나를 관찰하며, 염색체가 접히는 비밀을 풀고 있다.", date: "2026.02.04", readTime: "10min" },
];

const FALLBACK_POSTS = [
  { id: 1, title: "기초과학이 세상을 바꾸는 법", type: "REEL", thumbnail: "/reels/reel1.jpg", url: "https://www.instagram.com/reel/DVVbOIliSeb/" },
  { id: 2, title: "한국 노벨상 머지않았습니다", type: "REEL", thumbnail: "/reels/reel2.jpg", url: "https://www.instagram.com/reel/DVVa4dVidZp/" },
  { id: 3, title: "의사 대신 연구 선택한 이유", type: "REEL", thumbnail: "/reels/reel3.jpg", url: "https://www.instagram.com/reel/DVTIl0UiSyN/" },
  { id: 4, title: "23살에 대학원 입학합니다", type: "REEL", thumbnail: "/reels/reel4.jpg", url: "https://www.instagram.com/reel/DVTFakrCRgL/" },
];

function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useScrollReveal();
  return (<div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.7s cubic-bezier(0.25,1,0.5,1) ${delay}s, transform 0.7s cubic-bezier(0.25,1,0.5,1) ${delay}s` }}>{children}</div>);
}

function Nav({ scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(252,251,249,0.95)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", WebkitBackdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid #E8E6E1" : "1px solid transparent", transition: "all 0.4s ease" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={LOGO_SRC} alt="NextNobel" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.3px" }}>NextNobel</span>
        </a>
        <div className="desktop-nav" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Stories", "About", "Subscribe"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ color: item === "Subscribe" ? "#1A1A1A" : "#888", textDecoration: "none", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: item === "Subscribe" ? 500 : 400, letterSpacing: "0.3px", borderBottom: item === "Subscribe" ? "1px solid #1A1A1A" : "none", paddingBottom: item === "Subscribe" ? 2 : 0 }}>{item}</a>
          ))}
        </div>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5">
            {menuOpen ? (<><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></>) : (<><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>)}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-menu" style={{ background: "#FCFBF9", padding: "16px 24px 24px", borderBottom: "1px solid #E8E6E1" }}>
          {["Stories", "About", "Subscribe"].map(item => (<a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 0", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15, color: "#1A1A1A", textDecoration: "none", borderBottom: "1px solid #EDECEA" }}>{item}</a>))}
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: "140px 24px 72px" }}>
      <Reveal>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <img src={LOGO_SRC} alt="NextNobel" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }} />
          <div>
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: "#999", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Researcher Stories & Interviews</p>
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: "#BBB" }}>nextnobel.org</p>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 400, color: "#1A1A1A", lineHeight: 1.15, maxWidth: 640, letterSpacing: "-1px", marginBottom: 24 }}>당신의 가설이,<br />세상을 바꿀때까지.</h1>
      </Reveal>
      <Reveal delay={0.12}>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 16, color: "#777", lineHeight: 1.7, maxWidth: 460 }}>세상을 바꿀 연구자들의 이야기.<br />그들의 질문, 실패, 그리고 발견의 순간을 기록합니다.</p>
      </Reveal>
      <Reveal delay={0.18}><div style={{ marginTop: 56, height: 1, background: "#E0DDD8" }} /></Reveal>
    </section>
  );
}

function Featured({ story }) {
  const [hovered, setHovered] = useState(false);
  return (
    <section id="stories" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 72px" }}>
      <Reveal>
        <article onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: "#1A1A1A", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 500 }}>{story.category}</span>
            <span style={{ color: "#CCC", fontSize: 11 }}>·</span>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: "#AAA" }}>{story.readTime}</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, color: "#1A1A1A", lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 14, transform: hovered ? "translateX(6px)" : "none", transition: "transform 0.5s cubic-bezier(0.25,1,0.5,1)" }}>{story.title}</h2>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15, color: "#888", lineHeight: 1.65, maxWidth: 680, marginBottom: 20 }}>{story.excerpt}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: "#444" }}>{story.author}</span>
            <span style={{ color: "#CCC" }}>—</span>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: "#AAA" }}>{story.affiliation}</span>
          </div>
          <div style={{ marginTop: 36, height: 1, background: hovered ? "#1A1A1A" : "#E0DDD8", transition: "background 0.5s ease" }} />
        </article>
      </Reveal>
    </section>
  );
}

function StoryRow({ story, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={index * 0.05}>
      <article onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="story-row" style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 28, alignItems: "start", padding: "28px 0", borderBottom: "1px solid #E8E6E1", cursor: "pointer" }}>
        <div>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: "#1A1A1A", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 4 }}>{story.category}</span>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: "#BBB" }}>{story.date}</span>
        </div>
        <div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 500, color: "#1A1A1A", lineHeight: 1.3, marginBottom: 6, letterSpacing: "-0.2px", transform: hovered ? "translateX(4px)" : "none", transition: "transform 0.4s cubic-bezier(0.25,1,0.5,1)" }}>{story.title}</h3>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: "#999", lineHeight: 1.6 }}>{story.excerpt}</p>
          <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: "#666" }}>{story.author}</span>
            <span style={{ color: "#CCC", fontSize: 12 }}>·</span>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: "#AAA" }}>{story.affiliation}</span>
          </div>
        </div>
        <div className="read-time" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: "#BBB", paddingTop: 4, whiteSpace: "nowrap" }}>{story.readTime}</div>
      </article>
    </Reveal>
  );
}

function StoriesList({ stories }) {
  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 88px" }}>
      <Reveal>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: "#1A1A1A" }}>Recent</h2>
          <a href="#" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: "#AAA", textDecoration: "none" }}>View all →</a>
        </div>
        <div style={{ height: 1, background: "#1A1A1A" }} />
      </Reveal>
      {stories.map((story, i) => <StoryRow key={story.id} story={story} index={i} />)}
    </section>
  );
}

function InstagramSection() {
  const [hoveredId, setHoveredId] = useState(null);
  const [posts, setPosts] = useState(FALLBACK_POSTS);

  useEffect(() => {
    fetch("/api/reels")
      .then((res) => res.json())
      .then((data) => {
        if (data.reels && data.reels.length > 0) setPosts(data.reels);
      })
      .catch(() => {});
  }, []);

  const cols = posts.length <= 4 ? posts.length : 4;

  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 88px" }}>
      <Reveal>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="#1A1A1A" stroke="none" /></svg>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: "#1A1A1A" }}>@nextnobel</h2>
          </div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: "#AAA", textDecoration: "none" }}>Follow on Instagram →</a>
        </div>
        <div style={{ height: 1, background: "#1A1A1A", marginBottom: 24 }} />
      </Reveal>
      <Reveal delay={0.08}>
        <div className="insta-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
          {posts.map((post) => (
            <a key={post.id} href={post.url} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setHoveredId(post.id)} onMouseLeave={() => setHoveredId(null)} style={{ display: "block", textDecoration: "none", position: "relative", paddingBottom: "177.78%", background: "#1A1A1A", borderRadius: 8, overflow: "hidden", transition: "transform 0.4s cubic-bezier(0.25,1,0.5,1), box-shadow 0.4s ease", transform: hoveredId === post.id ? "translateY(-4px)" : "none", boxShadow: hoveredId === post.id ? "0 8px 24px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.06)" }}>
              <img src={post.thumbnail} alt={post.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s cubic-bezier(0.25,1,0.5,1)", transform: hoveredId === post.id ? "scale(1.05)" : "scale(1)" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 2, opacity: hoveredId === post.id ? 1 : 0.7, transition: "opacity 0.3s ease" }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.15)" /><polygon points="16,12 30,20 16,28" fill="rgba(255,255,255,0.8)" /></svg>
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 16px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))", zIndex: 2 }}>
                <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.9)" }}>{post.title}</span>
              </div>
              <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2, padding: "3px 8px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: "1px" }}>{post.type}</span>
              </div>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <section id="subscribe" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 88px" }}>
      <Reveal>
        <div style={{ maxWidth: 460 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: "#1A1A1A", marginBottom: 10 }}>Newsletter</h2>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: "#999", lineHeight: 1.65, marginBottom: 24 }}>매주 화요일, 한 편의 연구자 이야기를 보내드립니다.</p>
          {!submitted ? (
            <div style={{ display: "flex", borderBottom: `1px solid ${focused ? "#1A1A1A" : "#D0CEC9"}`, transition: "border-color 0.3s", paddingBottom: 8 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="your@email.com" style={{ flex: 1, background: "transparent", border: "none", color: "#1A1A1A", fontSize: 15, fontFamily: "'IBM Plex Sans', sans-serif", outline: "none", padding: "4px 0" }} />
              <button onClick={() => { if (email) setSubmitted(true); }} style={{ background: "transparent", border: "none", color: "#1A1A1A", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", cursor: "pointer", fontWeight: 500, padding: "4px 0", transition: "opacity 0.3s", opacity: email ? 1 : 0.3 }}>Subscribe →</button>
            </div>
          ) : (<p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: "#1A1A1A" }}>감사합니다. 다음 화요일에 만나요.</p>)}
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer id="about" style={{ borderTop: "1px solid #E0DDD8", maxWidth: 1080, margin: "0 auto", padding: "36px 24px 44px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={LOGO_SRC} alt="NextNobel" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontWeight: 600, color: "#1A1A1A" }}>NextNobel</span>
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: "#BBB", marginTop: 2 }}>다음 노벨상의 주인공이 될 연구자들의 이야기</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[{ label: "Instagram", url: INSTAGRAM_URL }, { label: "YouTube", url: "#" }, { label: "Contact", url: "mailto:hello@nextnobel.org" }].map(link => (
            <a key={link.label} href={link.url} target={link.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: "#AAA", textDecoration: "none" }}>{link.label}</a>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #EDECEA", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: "#CCC" }}>© 2026 NextNobel</span>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: "#CCC" }}>nextnobel.org</span>
      </div>
    </footer>
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  ::selection { background: #1A1A1A; color: #FCFBF9; }
  html { scroll-behavior: smooth; }
  body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  input::placeholder { color: #CCC; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D0CEC9; border-radius: 2px; }
  a:hover { color: #1A1A1A !important; }
  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: block !important; }
    .story-row { grid-template-columns: 1fr !important; gap: 8px !important; }
    .read-time { display: none !important; }
    .insta-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
  }
  @media (min-width: 769px) {
    .mobile-menu-btn { display: none !important; }
    .mobile-menu { display: none !important; }
  }
`;

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <div style={{ background: "#FCFBF9", minHeight: "100vh" }}>
      <style>{globalCSS}</style>
      <Nav scrolled={scrolled} />
      <Hero />
      <Featured story={STORIES[0]} />
      <StoriesList stories={STORIES.slice(1, 3)} />
      <InstagramSection />
      <Newsletter />
      <Footer />
    </div>
  );
}
