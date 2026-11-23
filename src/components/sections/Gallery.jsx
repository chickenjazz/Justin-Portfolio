import WordReveal from "../WordReveal.jsx";
export default function Gallery() {
  return (
    <section className="gallery section wrap" id="gallery">
      <div className="section-head">
        <p className="eyebrow">07 / BEYOND THE WORK</p>
        <WordReveal as="h2">
          Life in
          <br />
          <em>frames.</em>
        </WordReveal>
        <p>Selected personal and professional photographs to come.</p>
      </div>
      <div className="gallery-grid">
        <div>PHOTO / 01</div>
        <div>PHOTO / 02</div>
        <div>PHOTO / 03</div>
      </div>
    </section>
  );
}
