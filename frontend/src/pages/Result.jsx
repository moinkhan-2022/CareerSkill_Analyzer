function Result({
  role,
  skills,
  missingSkills
}) {
  return (
    <div>
      <h2>
        Analysis Result
      </h2>

      <br />

      <p>
        Selected Role:
        {" "}
        {role}
      </p>

      <br />

      <p>
        Your Skills:
        {" "}
        {skills}
      </p>

      <br />

      <h3>
        Missing Skills
      </h3>

      <ul>
        {missingSkills.map(
          (skill, index) => (
            <li key={index}>
              {skill}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default Result;