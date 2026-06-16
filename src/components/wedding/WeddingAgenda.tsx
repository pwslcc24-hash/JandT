export default function WeddingAgenda() {
  return (
    <div className="agenda-wrap">
      <h2 className="sr-only">Full wedding day agenda for August 5th</h2>
      <p className="agenda-title">Wedding Day</p>
      <p className="agenda-date">August 5th</p>

      <p className="section-label">Ceremony — Lindon Temple</p>
      <div className="timeline" style={{ marginBottom: "1.5rem" }}>
        <div className="tl-item">
          <div className="tl-dot accent" />
          <p className="tl-time">9:30 AM</p>
          <p className="tl-event">Arrive at temple</p>
        </div>
        <div className="tl-item">
          <div className="tl-dot accent" />
          <p className="tl-time">10:30 – 11:30 AM</p>
          <p className="tl-event">Sealing & get ready</p>
        </div>
        <div className="tl-item">
          <div className="tl-dot accent" />
          <p className="tl-time">11:30 AM – 12:30 PM</p>
          <p className="tl-event">Temple photos</p>
        </div>
      </div>

      <p className="section-label">Reception — Cedar Hills Golf Club</p>
      <div className="venue-card">
        <p className="venue-name">The Clubhouse at Cedar Hills Golf Club</p>
        <p className="venue-address">10640 Clubhouse Dr, Cedar Hills, UT</p>
        <div className="map-links">
          <a
            className="map-link"
            href="https://maps.apple.com/?address=10640+Clubhouse+Dr,+Cedar+Hills,+UT"
            target="_blank"
            rel="noopener noreferrer"
          >
            📍 Apple Maps
          </a>
          <a
            className="map-link"
            href="https://www.google.com/maps/search/?api=1&query=10640+Clubhouse+Dr,+Cedar+Hills,+UT"
            target="_blank"
            rel="noopener noreferrer"
          >
            📍 Google Maps
          </a>
        </div>
      </div>

      <div className="timeline" style={{ marginTop: "1rem" }}>
        <div className="tl-item">
          <div className="tl-dot" />
          <p className="tl-time">12:00 – 2:00 PM</p>
          <p className="tl-event">Venue setup</p>
        </div>
        <div className="tl-item break-item">
          <div className="tl-dot" />
          <p className="tl-time">2:00 – 3:30 PM</p>
          <p className="tl-event">Break</p>
        </div>
        <div className="tl-item">
          <div className="tl-dot accent" />
          <p className="tl-time">3:00 – 3:30 PM</p>
          <p className="tl-event">Bridal party rehearsal</p>
        </div>
        <div className="tl-item">
          <div className="tl-dot accent" />
          <p className="tl-time">3:30 – 4:30 PM</p>
          <p className="tl-event">Ring ceremony & photos</p>
        </div>
        <div className="tl-item">
          <div className="tl-dot accent" />
          <p className="tl-time">4:30 – 6:00 PM</p>
          <p className="tl-event">Dinner</p>
        </div>
        <div className="tl-item">
          <div className="tl-dot accent" />
          <p className="tl-time">6:00 – 7:00 PM</p>
          <p className="tl-event">Mariachi band, lawn games & mingling</p>
        </div>
        <div className="tl-item">
          <div className="tl-dot accent" />
          <p className="tl-time">6:30 – 9:30 PM</p>
          <p className="tl-event">Reception</p>
        </div>
      </div>
    </div>
  );
}
