export default function ProjectDetails({ project }) {
  return (
    <div className="case-study">
      <p className="eyebrow">{project.category}</p>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <h4>My contribution</h4>
      <ul>
        {project.contributions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h4>Technologies</h4>
      <p>{project.technologies.join(" · ")}</p>
      {project.results && (
        <div className="case-results">
          <h4>Study results</h4>
          <dl>
            {project.results.map((result) => (
              <div key={result.label}>
                <dt>{result.label}</dt>
                <dd>{result.value}</dd>
              </div>
            ))}
          </dl>
          <p>{project.resultNote}</p>
        </div>
      )}
      <p className="placeholder">{project.missingAssets}</p>
    </div>
  );
}
