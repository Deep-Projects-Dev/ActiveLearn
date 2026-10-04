const socials = [
  {
    id: "instagram",
    name: "Instagram",
    username: "@deepprojects.dev",
    about: "Followers: sin(π)",
    href: "https://instagram.com/deepprojects.dev/",
    initials: "IG",
    viewBox: "0 0 448 512",
    icon: (
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    ),
  },
  {
    id: "discord",
    name: "Discord",
    username: "Deep Projects",
    about: "Join our community.",
    href: "https://discord.gg/WfA3f64C4",
    initials: "DC",
    viewBox: "0 0 640 512",
    icon: (
      <path d="M297.216 119.716c-12.495-5.772-25.939-10.018-39.94-12.267a.604.604 0 0 0-.63.304c-1.713 3.038-3.617 7.005-4.95 10.175-14.935-2.247-29.772-2.247-44.435 0-1.333-3.24-3.305-7.137-5.027-10.175a.616.616 0 0 0-.63-.304c-14.002 2.25-27.445 6.496-39.94 12.267a.57.57 0 0 0-.267.22C132.75 155.09 121.02 190.15 124.2 224.82c.015.169.098.333.225.44 16.79 12.34 33.06 19.827 49.02 24.785a.62.62 0 0 0 .67-.226c3.8-5.237 7.186-10.824 10.1-16.67a.61.61 0 0 0-.334-.85 104.7 104.7 0 0 1-15.31-7.28.61.61 0 0 1-.062-1.02c1.03-.77 2.06-1.57 3.046-2.376a.59.59 0 0 1 .62-.083c32.108 14.67 66.807 14.67 98.535 0a.59.59 0 0 1 .63.069c.986.806 2.015 1.62 3.06 2.391a.61.61 0 0 1-.053 1.02 100.5 100.5 0 0 1-15.34 7.267.61.61 0 0 0-.327.856c2.935 5.85 6.32 11.435 10.09 16.67a.62.62 0 0 0 .67.236c15.98-4.96 32.25-12.445 49.04-24.785a.61.61 0 0 0 .225-.432c3.8-40.123-6.45-74.89-30.29-105.04a.5.5 0 0 0-.25-.22ZM177.95 202.93c-9.61 0-17.26-8.86-17.26-19.75s7.5-19.83 17.26-19.83c9.81 0 17.38 8.94 17.26 19.83 0 10.89-7.5 19.75-17.26 19.75Zm92.1 0c-9.61 0-17.26-8.86-17.26-19.75s7.5-19.83 17.26-19.83c9.81 0 17.38 8.94 17.26 19.83 0 10.89-7.5 19.75-17.26 19.75Z" />
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    username: "Don't yet have LI.",
    about: "Connect with us.",
    href: "#",
    initials: "in",
    viewBox: "0 0 448 512",
    icon: (
      <path d="M100.28 448H7.4V148.9h92.88zm-46.54-340.7C24.09 107.3 0 83.2 0 53.6A53.6 53.6 0 0 1 53.74 0c29.69 0 53.77 24.1 53.77 53.6 0 29.6-24.08 53.7-53.77 53.7zM447.9 448h-92.68V302.4c0-34.7-.7-79.3-48.29-79.3-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    ),
  },
];

function SocialIcon({ social }) {
  return (
    <div className={`tooltip-container ${social.id}`}>
      <div className="tooltip">
        <div className="profile">
          <div className="user">
            <div className="img">{social.initials}</div>

            <div className="details">
              <div className="name">{social.name}</div>
              <div className="username">{social.username}</div>
            </div>
          </div>

          <div className="sAbout">{social.about}</div>
        </div>
      </div>

      <div className="text">
        <a
          className="icon"
          href={social.href}
          aria-label={social.name}
          target="_blank"
          rel="noreferrer"
        >
          <div className="layer">
            <span />
            <span />
            <span />
            <span />
            <span className="socialSVG">
              <svg
                className="svgIcon"
                viewBox={social.viewBox}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                {social.icon}
              </svg>
            </span>
          </div>

          <div className="label">{social.name}</div>
        </a>
      </div>
    </div>
  );
}

export default function Socials() {
  return (
    <>
      {socials.map((social) => (
        <SocialIcon social={social} key={social.id} />
      ))}
    </>
  );
}
