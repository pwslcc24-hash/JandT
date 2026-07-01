import { motion } from "framer-motion";
import PageChrome from "@/components/wedding/PageChrome";
import { slideDown } from "@/lib/motionVariants";

const STORY_SECTIONS = [
  {
    title: "A Lot Had to Happen",
    jayden:
      "A lot of things came together so Taylor and I could meet. I had to run, go on a mission, transfer from D1 to a JUCO, and eventually end up at Utah State. There were a lot of unexpected turns but it all came together. I had a few opportunities to run in college, some with better offers than I got from Utah State, but Utah State just felt like the place I needed to be. Looking back, I think I ended up exactly where I was supposed to.",
    taylor:
      "I had a few opportunities to run in college, some with better offers than I got from Utah State, but Utah State just felt like the place I needed to be. Looking back, I think I ended up exactly where I was supposed to.",
    media: [],
  },
  {
    title: "The Quad",
    jayden:
      "On a warm late summer evening at a school kick off party at the Quad. I was with some of the few people I knew on the team. Because of complications in the transferring process, I was ineligible to compete so I had missed cross-country camp and all the team building and getting to know each other at meetings. When my friends introduced me to a group of girls as the ineligible kid. That's where I met Taylor.",
    taylor:
      "I had gone to cross country camp, moved in, and already had been practicing with the team when I first met Jayden. A few weeks into school, my roommates and I went to a back-to-school activity on the Quad. We ran into some of the guys from the team, and they introduced us to Jayden, who wasn't eligible to compete yet.",
    media: [{ type: "video", size: "tall" }],
  },
  {
    title: '"TAYLOR!"',
    jayden:
      'The next day, leaving biology class, I saw her across the lecture hall and yelled "TAYLOR!" I walked over and asked, "That\'s your name, right?" 😏and hit her with something like "I like gold arm band" 😉 We ended up walking back toward my car and her apartment. We were both new to campus and she was a little lost, so I confidently led us in the wrong way while we talked and laughed the whole way.',
    taylor:
      'The next day, I heard someone yell my name across biology class as I was leaving, "TAYLOR!" I turned around and saw Jayden. He came up and asked, "That\'s your name, right?" We started talking and ended up walking back toward his car and my apartment together.',
    media: [],
  },
  {
    title: "Biology & Study Sessions",
    jayden:
      "After that, we started walking together after every class, chatting and laughing. While on our walks she'd tilt her head into my field of vision, stealing my attention away from the ground I was zoned out on. I would even park my car the place I did the first day so I could walk with her… until my car broke down and I got rides from her—which worked out pretty well for me. We started out walking and chatting, then we started sitting next to each other and then we studied together for hours. Wherever we were those big brown eyes would penetrate my soul with the longest maintained eye contact ever. We had the funniest study sessions and inside jokes about biology. I never did so well in a final.",
    taylor:
      'After that, we walked home from biology almost every day. One day as we were walking home together, my roommate saw me with him and texted me "Oooh Taylor walking with a boy," to which I responded, "Hahha it\'s just Jayden." We started studying together, making flashcards, and spending more and more time together. He made me laugh and smile. I loved that he could draw and had good handwriting. But I think I was trying to convince myself that I didn\'t like him because I had gone into college not really wanting to date. One day, I mentioned that I needed to clean my apartment\'s kitchen, and he offered to help. I told my brother later, and he said, "No guy would do that if he doesn\'t like the girl." I didn\'t believe him. I thought Jayden was just a genuinely kind person. I also started giving him car rides to places because his car was broken, so we spent a lot of time together because of that.',
    media: [
      { type: "video", size: "tall" },
      { type: "video", size: "tall" },
    ],
  },
  {
    title: "In-N-Out",
    jayden:
      "I eventually hosted a karaoke and Just Dance party because I wanted her to come. Afterward, we all went to In-N-Out, where I taught her salsa dancing in the middle of the restaurant. Then we sat on a table together drinking soda water with lemons and pretending we were in Italy, making up picture book stories, making up rhymes and just talking.",
    taylor:
      "Then he invited me to a party at his house. Afterward, we all went to In-N-Out, and somehow he started teaching me salsa dancing. I remember thinking that maybe he liked me because he seemed hesitant to dance with anyone else. Later that night, we sat on top of a table drinking soda water with lemons and pretended we were in Italy. I went home completely confused.",
    media: [{ type: "video", size: "tall" }],
  },
  {
    title: "Melted Ice Cream",
    jayden:
      'After one of our long study sessions, Taylor invited me over for homemade enchiladas. She started helping me read a school assigned book. We would alternate switching who would read and take breaks listening to music and talking. Later, as she was driving me home, my friends called me giving me a hard time about being at the freshmen dorms then asked if I wanted to go out for ice cream. I responded, "We have ice cream at home." I convinced Taylor to come over for said ice cream. Unfortunately our freezer was broken, so we ate fluffy, melted, freezer-burned ice cream out of plastic cups and watched a baseball game where she awkwardly sat on another couch…',
    taylor:
      "A few days later, we were both super hungry after studying, and I had made homemade enchiladas, so I invited him over. We ate and talked, then I drove him home because his car was broken. His friends wanted to go get ice cream, and he insisted I stay at his house and have some. The ice cream was melted because his freezer was broken, and we ate it from plastic cups because he only had one bowl.",
    media: [],
  },
  {
    title: '"Just Friends"',
    jayden:
      'Seeing her unamused at the baseball game and alone on the couch, I took her to our front room and asked if she would help me read my school book again. As we read I swear to this day that she was staring at me and playing with her lips as we were reading. She got closer and closer until eventually she was under my arm and she started showing me childhood photos and told me her whole life story. I thought for sure she was smitten. Apparently, she saw me as "just friends."',
    taylor:
      'Eventually, we moved to another room to read, and somehow we ended up sitting next to each other with his arm around me while I talked about myself. I was super confused because throughout the time we had known each other I thought we were just friends. So I was quite surprised that when I decided it was time to go, he walked me out and gave me a hug. After I left that night, I immediately called my mom. She laughed and said, "I think you probably like him, Taylor." That was the first time I realized that I did.',
    media: [
      { type: "photo", size: "short" },
      { type: "video", size: "short" },
      { type: "photo", size: "short" },
    ],
  },
  {
    title: "The First Date",
    jayden:
      "But just being friends wouldn't last long for her… While I was away in Wisconsin for a race, I asked her on our first date. I picked her up, and the conversation immediately just flowed. There was not an ounce of awkwardness. We got lost trying to find a pumpkin patch I had never been to but thought I could find with no directions. Luckily we eventually stumbled upon one on the side of the road. We carved pumpkins, listened to music, and I made her a spectacular 3-course dinner. Watched a movie and then we kissed...",
    taylor:
      "A few days later, while he was away for a race, he asked me on a date. He told me it was a surprise. I walked out, excited to see him. There was never any awkwardness or unfamiliarity between us. It felt like I had known him for years. We found pumpkins on the side of a road to carve. He helped me because my artistic skills are terrible. I think I fell in love with him when he made me dinner, though. Food is my love language. He made me steak, bruschetta, chicken, and vegetables. I did the dishes (which is now quite a normal routine for us), and then we watched Tangled on the couch. He knew almost every line of the movie, which I thought was pretty cute. Then he kissed me.",
    media: [
      { type: "photo", size: "tall" },
      { type: "video", size: "tall" },
      { type: "photo", size: "tall" },
    ],
  },
  {
    title: "Since Then",
    jayden:
      "I have fallen in love with her, so in love that I couldn't wait to get married, and I'm so excited. Taylor loves food almost as much as me; she's much, much smarter than me (although I did better in the biology final) she is extremely patient with my ludicrousness, I love talking with her because she goes with my scattered unorganized conversations and we can ramble for hours, she has the most beautiful singing voice, I love her love of God and her relationship with him. I can't wait to start a family with her. I'm so excited to make every day special, supporting each other in our goals, and having an indefinite running partner. All of these things make me so excited to marry her but are not why I love her. I love Taylor simply because I do, it is indescribable!",
    taylor:
      "Since then, we've spent almost every day together, and I still don't get tired of it. I LOVE Jayden Holdsworth. He loves music and dancing; he always knows how to have a good time; he's good with kids; he loves food (and can cook!); he loves God, and he's helped me get closer to Him. He is patient with me, and he encourages me to be better. He's gentle and sweet. I'm so excited to start the rest of my life with him. I know that he will do anything to give me the most perfect, magical, happy life. I've never felt an ounce of doubt since meeting him. I am so so excited for August 5th, because that means I get to spend everday for forever with him!",
    media: [{ type: "photo", size: "tall" }],
  },
];

const styles = {
  page: {
    fontFamily: "'Times New Roman', Times, serif",
    background: "#FAF7F2",
    color: "#1a1208",
    minHeight: "100vh",
  },
  content: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "2rem 1.5rem 4rem",
  },
  pageTitle: {
    fontSize: 42,
    fontStyle: "italic",
    fontWeight: 400,
    color: "#1a1208",
    margin: "0 0 3rem 0",
    lineHeight: 1.2,
    textAlign: "left",
  },
  sectionHeading: {
    fontSize: 36,
    fontStyle: "italic",
    fontWeight: 400,
    color: "#1a1208",
    textAlign: "center",
    margin: "0 0 2rem 0",
    lineHeight: 1.2,
  },
  bodyGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.25rem 2.5rem",
    marginBottom: "1.5rem",
  },
  povLabel: {
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: "0.13em",
    textTransform: "uppercase",
    color: "#888888",
    margin: "0 0 0.35rem 0",
  },
  bodyText: {
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.8,
    color: "#3a352e",
    margin: 0,
  },
  mediaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: "2.75rem",
  },
  mediaBoxBase: {
    flex: 1,
    minWidth: 140,
    borderRadius: 10,
    background: "#ede9e1",
    border: "1px dashed #c9a97a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  mediaIcon: {
    fontSize: 22,
    lineHeight: 1,
    opacity: 0.5,
    marginBottom: "0.35rem",
  },
  mediaLabel: {
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#999999",
  },
  rule: {
    border: 0,
    borderTop: "1px solid #c9a97a",
    opacity: 0.35,
    margin: "0 0 2.75rem",
  },
};

function MediaPlaceholder({ type, size }) {
  const icon = type === "photo" ? "🖼" : "▶";
  const label = type === "photo" ? "Photo" : "Video";
  return (
    <div
      style={{
        ...styles.mediaBoxBase,
        minHeight: size === "tall" ? 220 : 160,
      }}
    >
      <span style={styles.mediaIcon} aria-hidden="true">{icon}</span>
      <span style={styles.mediaLabel}>{label}</span>
    </div>
  );
}

export default function OurStory() {
  return (
    <PageChrome>
      <style>{`
        .os-wrap, .os-wrap * { font-family: 'Times New Roman', Times, serif !important; }
        @media (max-width: 520px) {
          .os-body-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="os-wrap">
        {/* Page title animates in with the chrome stagger */}
        <motion.h1 style={styles.pageTitle} variants={slideDown}>Our Story</motion.h1>

        {STORY_SECTIONS.map((section, index) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
          >
            <motion.h2
              style={styles.sectionHeading}
              initial={{ opacity: 0, y: -18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", damping: 26, stiffness: 280, delay: 0.06 }}
            >
              {section.title}
            </motion.h2>

            <motion.div
              className="os-body-grid"
              style={styles.bodyGrid}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", damping: 26, stiffness: 280, delay: 0.12 }}
            >
              <div>
                <p style={styles.povLabel}>JAYDEN</p>
                <p style={styles.bodyText}>{section.jayden}</p>
              </div>
              <div>
                <p style={styles.povLabel}>TAYLOR</p>
                <p style={styles.bodyText}>{section.taylor}</p>
              </div>
            </motion.div>

            {section.media.length > 0 && (
              <motion.div
                style={styles.mediaRow}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", damping: 26, stiffness: 280, delay: 0.18 }}
              >
                {section.media.map((item, i) => (
                  <MediaPlaceholder key={i} type={item.type} size={item.size} />
                ))}
              </motion.div>
            )}

            {index < STORY_SECTIONS.length - 1 && (
              <motion.hr
                style={styles.rule}
                initial={{ opacity: 0, scaleX: 0.5, x: 40 }}
                whileInView={{ opacity: 1, scaleX: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", damping: 26, stiffness: 280, delay: 0.22 }}
              />
            )}
          </motion.section>
        ))}
      </div>
    </PageChrome>
  );
}