import { useState } from "react";

import RoleSelector from "../components/RoleSelector";
import SkillInput from "../components/SkillInput";
import AnalyzeButton from "../components/AnalyzeButton";

import Result from "./Result";

import { roles } from "../data/roles";

function Home() {
  const [role, setRole] =
    useState("SDE");

  const [skills, setSkills] =
    useState("");

  const [
    missingSkills,
    setMissingSkills
  ] = useState([]);

  const [showResult,
    setShowResult] =
    useState(false);

  function handleAnalyze() {
    const userSkills =
      skills
        .split(",")
        .map((skill) =>
          skill.trim()
        );

    const requiredSkills =
      roles[role];

    const missing =
      requiredSkills.filter(
        (skill) =>
          !userSkills.includes(
            skill
          )
      );

    setMissingSkills(missing);

    setShowResult(true);
  }

  return (
    <div>
      <h1>
        Skill Gap Analyzer
      </h1>

      <p>
        Find missing skills
        for your dream job.
      </p>

      <br />

      <RoleSelector
        role={role}
        setRole={setRole}
      />

      <SkillInput
        skills={skills}
        setSkills={setSkills}
      />

      <AnalyzeButton
        handleAnalyze={
          handleAnalyze
        }
      />

      <br />

      {showResult && (
        <Result
          role={role}
          skills={skills}
          missingSkills={
            missingSkills
          }
        />
      )}
    </div>
  );
}

export default Home;