import Image from "next/image";
import Link from "next/link";
import { Action } from "@/components/site-shell";

export default function Home() {
  return (
    <>
      <section
        className="home-hero dark grid-surface"
        aria-labelledby="hero-title"
      >
        <div className="container">
          <div className="hero-layout">
            <div className="hero-copy">
              <h1 id="hero-title">
                Make a game.
                <br />
                Make it yours.
              </h1>
              <p className="lead">
                Build with Gemu&apos;s voxel engine. Bring your game to life
                with multiplayer, physics and Steam integration.
              </p>
              <div className="actions">
                <Action flow="engine">
                  Request engine access <span aria-hidden="true">↗</span>
                </Action>
                <Action flow="publishing" className="button secondary">
                  Submit a game <span aria-hidden="true">→</span>
                </Action>
              </div>
              <p className="small">
                Early access with selected studios.
                <br />
                Introduce your project through the access preview.
              </p>
            </div>
            <figure className="hero-visual">
              <Image
                src="/gemu/voxel-world.png"
                alt="Voxel concept landscape with a timber outpost, river and pine forest"
                width={1672}
                height={941}
                sizes="(max-width: 800px) 100vw, 55vw"
                preload
              />
            </figure>
          </div>
        </div>
      </section>
      <div className="pathways container">
        <a href="#engine">
          <span className="eyebrow">For developers</span>
          <strong>
            Build with Gemu <span aria-hidden="true">↗</span>
          </strong>
        </a>
        <Link href="/community">
          <span className="eyebrow">For the community</span>
          <strong>
            Find an answer <span aria-hidden="true">↗</span>
          </strong>
        </Link>
        <Link href="/assets">
          <span className="eyebrow">For creators</span>
          <strong>
            Find your building blocks <span aria-hidden="true">↗</span>
          </strong>
        </Link>
      </div>
      <section id="engine" className="section container">
        <div className="engine-intro">
          <div>
            <h2>Gemu Engine</h2>
            <p>
              A voxel engine with core systems built in, so you can focus on
              your game.
            </p>
          </div>
          <Action flow="engine">
            Request engine access <span aria-hidden="true">↗</span>
          </Action>
        </div>
        <div className="capabilities">
          <article>
            <Image
              src="/gemu/feature-multiplayer-physics.png"
              alt="Voxel concept of two robot players balancing and moving a stack of cubes"
              width={1536}
              height={1024}
              sizes="(max-width: 500px) 100vw, (max-width: 800px) 50vw, 25vw"
            />
            <div className="capability-copy">
              <h3>Multiplayer & physics</h3>
              <p>
                Built-in multiplayer and advanced physics for connected worlds.
              </p>
            </div>
          </article>
          <article>
            <Image
              src="/gemu/feature-lighting-audio.png"
              alt="Voxel concept of a room with geometric light, shadows and a speaker"
              width={1536}
              height={1024}
              sizes="(max-width: 500px) 100vw, (max-width: 800px) 50vw, 25vw"
            />
            <div className="capability-copy">
              <h3>Lighting & audio</h3>
              <p>
                Native ray-traced lighting and audio for your voxel
                environments.
              </p>
            </div>
          </article>
          <article>
            <Image
              src="/gemu/feature-steam-integration.png"
              alt="Voxel concept of a game controller on connected platforms"
              width={1536}
              height={1024}
              sizes="(max-width: 500px) 100vw, (max-width: 800px) 50vw, 25vw"
            />
            <div className="capability-copy">
              <h3>Steam integration</h3>
              <p>
                Steam backend integration as part of the development workflow.
              </p>
            </div>
          </article>
          <article>
            <Image
              src="/gemu/feature-connected-tools.png"
              alt="Voxel concept of a workbench with modular blocks, a wrench and connectors"
              width={1536}
              height={1024}
              sizes="(max-width: 500px) 100vw, (max-width: 800px) 50vw, 25vw"
            />
            <div className="capability-copy">
              <h3>Connect your tools</h3>
              <p>Native Model Context Protocol support for compatible tools.</p>
            </div>
          </article>
        </div>
        <p className="small capability-note">AI concept illustrations</p>
      </section>
      <div className="resource-strip container">
        <strong>Already building?</strong>
        <Link href="/community">
          Search developer questions <span aria-hidden="true">→</span>
        </Link>
        <Action info="docs" className="text-button">
          Documentation <span aria-hidden="true">↗</span>
        </Action>
      </div>
      <section className="section showcase-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>A place for voxel creators</h2>
            </div>
          </div>
          <div className="showcase-grid">
            <figure>
              <Image
                src="/gemu/voxel-world.png"
                alt="Voxel forest and river environment concept"
                width={1672}
                height={941}
                sizes="(max-width: 800px) 100vw, 50vw"
              />
              <figcaption>
                <span className="eyebrow">AI concept illustration</span>
                <h3>A world to build in</h3>
                <p>
                  An imagined voxel landscape. Approved Gemu gameplay and
                  project footage will belong here.
                </p>
              </figcaption>
            </figure>
            <figure>
              <Image
                src="/gemu/voxel-cabin.png"
                alt="Modular timber cabin and separate building pieces made of voxels"
                width={1448}
                height={1086}
                sizes="(max-width: 800px) 100vw, 50vw"
              />
              <figcaption>
                <span className="eyebrow">AI concept illustration</span>
                <h3>Start with building blocks</h3>
                <p>
                  Explore models, environments and tools in the sample
                  catalogue.
                </p>
                <Link className="text-link" href="/assets">
                  Explore voxel assets <span aria-hidden="true">→</span>
                </Link>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section id="publishing" className="section container two-column">
        <div>
          <h2>
            Got a game?
            <br />
            Let&apos;s talk.
          </h2>
          <p>
            Gemu publishes games and incubates studios. Introduce your project
            and the support you are looking for.
          </p>
          <Action flow="publishing">
            Submit a game <span aria-hidden="true">→</span>
          </Action>
        </div>
        <ol className="publishing-steps">
          <li>
            <span aria-hidden="true">01</span>
            <div>
              <h3>Show your game</h3>
              <p>Share the idea, prototype or pitch.</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">02</span>
            <div>
              <h3>Tell us what you need</h3>
              <p>Describe your stage and the support you seek.</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">03</span>
            <div>
              <h3>Start a conversation</h3>
              <p>
                A real pitch would go to Gemu for review. This draft shows a
                form placeholder.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <section id="bootcamp" className="bootcamp-section">
        <div className="container section two-column">
          <figure>
            <Image
              src="/gemu/voxel-cabin.png"
              alt="Voxel cabin building-kit concept"
              width={1448}
              height={1086}
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </figure>
          <div>
            <h2>GEMU Bootcamp</h2>
            <p>
              Explore a path from your first project toward building a studio.
              Tell us what you want to learn and where you are starting.
            </p>
            <Action flow="bootcamp">
              Register Bootcamp interest <span aria-hidden="true">↗</span>
            </Action>
            <p className="small">
              Program format, dates and eligibility to confirm.
            </p>
          </div>
        </div>
      </section>
      <section id="partners" className="section container two-column">
        <div>
          <h2>
            Support the
            <br />
            next studio.
          </h2>
          <p>
            Explore studio investment, game funding or licensing Gemu
            technology.
          </p>
        </div>
        <div className="partner-cards">
          <article>
            <h3>Invest in what comes next</h3>
            <p>Start a conversation about studios and game funding.</p>
            <Action flow="investment" className="text-button">
              Discuss investment or funding <span aria-hidden="true">↗</span>
            </Action>
          </article>
          <article>
            <h3>Build with the technology</h3>
            <p>Introduce your needs for licensing Gemu technology.</p>
            <Action flow="licensing" className="text-button">
              Discuss technology licensing <span aria-hidden="true">↗</span>
            </Action>
          </article>
        </div>
      </section>
      <section className="closing dark grid-surface">
        <div className="container">
          <div>
            <h2>
              What do you
              <br />
              want to make?
            </h2>
          </div>
          <div>
            <p>
              Start with engine access.
              <br />
              Or tell us about your game.
            </p>
            <div className="actions">
              <Action flow="engine">
                Request engine access <span aria-hidden="true">↗</span>
              </Action>
              <Action flow="publishing" className="button secondary">
                Submit a game
              </Action>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
