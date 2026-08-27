export default function StudyPreferences({ availableDays, hoursPerDay, onDaysChange, onHoursChange }) {
  return <div className="grid gap-4 sm:grid-cols-2">
    <div><label className="field-label" htmlFor="available-days">Available Days</label><input id="available-days" className="field-input" type="number" min="1" max="30" step="1" value={availableDays} onChange={(event) => onDaysChange(event.target.value)} placeholder="e.g. 7" /></div>
    <div><label className="field-label" htmlFor="hours-per-day">Hours Per Day</label><input id="hours-per-day" className="field-input" type="number" min="1" max="8" step="1" value={hoursPerDay} onChange={(event) => onHoursChange(event.target.value)} placeholder="e.g. 2" /></div>
  </div>
}
