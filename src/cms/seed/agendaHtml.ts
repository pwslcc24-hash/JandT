/** Default wedding-day agenda HTML for the info page CMS block */
export const DEFAULT_AGENDA_HTML = `
<div class="agenda-wrap">
  <h2 class="sr-only">Full wedding day agenda for August 5th</h2>
  <p class="agenda-title">Wedding Day</p>
  <p class="agenda-date">August 5th</p>

  <div class="timeline">
    <div class="timeline-insert">
      <p class="section-label">Temple Ceremony</p>
      <div class="venue-card">
        <p class="venue-name">Lindon Temple</p>
        <div class="map-links">
          <a class="map-link" href="https://maps.apple.com/directions?destination=The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints%2C%2087%20N%20800%20E%2C%20Lindon%2C%20UT%20%2084042%2C%20United%20States&destination-place-id=IB0E62CE7EFF32EB5&mode=driving" target="_blank" rel="noopener noreferrer">📍 Apple Maps</a>
          <a class="map-link" href="https://maps.app.goo.gl/67D4ZFSk5RUF18wM8" target="_blank" rel="noopener noreferrer">📍 Google Maps</a>
        </div>
      </div>
    </div>

    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">10:30 – 11:30 AM</p>
      <p class="tl-event">Sealing at Lindon Temple</p>
    </div>

    <div class="timeline-insert timeline-insert--vista">
      <p class="section-label">Celebration continues at The Vista</p>
      <div class="venue-card">
        <p class="venue-name">The Vista at Cedar Hills</p>
        <p class="venue-address">10640 Clubhouse Dr, Cedar Hills, UT</p>
        <div class="map-links">
          <a class="map-link" href="https://maps.apple.com/?address=10640+Clubhouse+Dr,+Cedar+Hills,+UT" target="_blank" rel="noopener noreferrer">📍 Apple Maps</a>
          <a class="map-link" href="https://www.google.com/maps/search/?api=1&query=10640+Clubhouse+Dr,+Cedar+Hills,+UT" target="_blank" rel="noopener noreferrer">📍 Google Maps</a>
        </div>
      </div>
    </div>

    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">3:30 – 4:00 PM</p>
      <p class="tl-event">Ring ceremony</p>
    </div>
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">4:30 – 6:00 PM</p>
      <p class="tl-event">Family dinner</p>
    </div>
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">6:00 – 7:00 PM</p>
      <p class="tl-event">Mariachi band<br />Lawn games</p>
    </div>
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">6:30 – 9:30 PM</p>
      <p class="tl-event">Reception</p>
    </div>
  </div>
</div>
`.trim();
