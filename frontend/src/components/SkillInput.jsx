function SkillInput({
  skills,
  setSkills
}) {
  return (
    <div>
      <br />

      <label>
        Enter Your Skills:
      </label>

      <br />
      <br />

      <input
        type="text"
        value={skills}
        placeholder="HTML,CSS,JavaScript"
        onChange={(e) =>
          setSkills(e.target.value)
        }
      />
    </div>
  );
}

export default SkillInput;