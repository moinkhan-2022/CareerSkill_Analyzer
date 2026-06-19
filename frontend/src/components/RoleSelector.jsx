function RoleSelector({ role, setRole }) {
  return (
    <div>
      <label>Select Role:</label>

      <br />
      <br />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="SDE">SDE</option>

        <option value="Java Developer">
          Java Developer
        </option>

        <option value="Frontend Developer">
          Frontend Developer
        </option>
      </select>
    </div>
  );
}

export default RoleSelector;