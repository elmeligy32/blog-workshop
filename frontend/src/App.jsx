export default function App() {
  return (
    <div className="container page">
      <div>
        <h1>Latest posts</h1>
        <p className="lead">Everything published by the community, newest first.</p>
      </div>
      <div>
        <button className="btn btn-primary">Sign up</button>{" "}
        <button className="btn btn-outline">Next</button>{" "}
        <span className="badge">Engineering</span>
      </div>
    </div>
  );
}