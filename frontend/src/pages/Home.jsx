import RoleSelector from "../components/RoleSelector";
import SkillInput from "../components/SkillInput";
import AnalyzeButton from "../components/AnalyzeButton";

function Home() {
  return (
    <div>
      <h1>Skill Gap Analyzer</h1>

      <p>
        Find missing skills for your dream job.
      </p>

      <br />

      <RoleSelector />

      <SkillInput />

      <AnalyzeButton />
    </div>
  );
}

export default Home;