/** Default wedding-day agenda HTML for the info page CMS block */
export const DEFAULT_AGENDA_HTML = `
<div class="agenda-wrap">
  <h2 class="sr-only">Full wedding day agenda for August 5th</h2>
  <p class="agenda-title">Wedding Day</p>
  <p class="agenda-date">August 5th</p>

  <p class="section-label">Ceremony — Lindon Temple</p>
  <div class="timeline" style="margin-bottom: 1.5rem;">
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">9:30 AM</p>
      <p class="tl-event">Arrive at temple</p>
    </div>
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">10:30 – 11:30 AM</p>
      <p class="tl-event">Sealing & get ready</p>
    </div>
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">11:30 AM – 12:30 PM</p>
      <p class="tl-event">Temple photos</p>
    </div>
  </div>

  <p class="section-label">Reception — Cedar Hills Golf Club</p>
  <div class="venue-card">
    <p class="venue-name">The Clubhouse at Cedar Hills Golf Club</p>
    <p class="venue-address">10640 Clubhouse Dr, Cedar Hills, UT</p>
    <div class="map-links">
      <a class="map-link" href="https://maps.apple.com/?address=10640+Clubhouse+Dr,+Cedar+Hills,+UT" target="_blank" rel="noopener noreferrer">📍 Apple Maps</a>
      <a class="map-link" href="https://www.google.com/maps/search/?api=1&query=10640+Clubhouse+Dr,+Cedar+Hills,+UT" target="_blank" rel="noopener noreferrer">📍 Google Maps</a>
    </div>
  </div>

  <div class="timeline" style="margin-top: 1rem;">
    <div class="tl-item">
      <div class="tl-dot"></div>
      <p class="tl-time">12:00 – 2:00 PM</p>
      <p class="tl-event">Venue setup</p>
    </div>
    <div class="tl-item break-item">
      <div class="tl-dot"></div>
      <p class="tl-time">2:00 – 3:30 PM</p>
      <p class="tl-event">Break</p>
    </div>
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">3:00 – 3:30 PM</p>
      <p class="tl-event">Bridal party rehearsal</p>
    </div>
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">3:30 – 4:30 PM</p>
      <p class="tl-event">Ring ceremony & photos</p>
    </div>
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">4:30 – 6:00 PM</p>
      <p class="tl-event">Dinner</p>
    </div>
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">6:00 – 7:00 PM</p>
      <p class="tl-event">Mariachi band, lawn games & mingling</p>
    </div>
    <div class="tl-item">
      <div class="tl-dot accent"></div>
      <p class="tl-time">6:30 – 9:30 PM</p>
      <p class="tl-event">Reception</p>
    </div>
  </div>
</div>
`.trim();
