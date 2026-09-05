"use client";

import { HeaderBlock } from "@/components/hud/pages/HeaderBlock";
import { TextBlock } from "@/components/hud/pages/TextBlock";
import { useSatMapStore } from "@/store/satmapStore";
import { SuccessBlock } from "@/components/hud/pages/SuccessBlock";
import { CautionBlock } from "@/components/hud/pages/CautionBlock";

const DocsPage = () => {
  const menuOpen = useSatMapStore((s) => s.menuOpen);

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 pointer-events-auto w-3/4 md:w-[60%] lg:w-1/2 max-h-3/4 ${
        menuOpen ? "invisible" : "visible"
      }`}
    >
      <HeaderBlock header="Docs v1.0" />

      <div className="flex flex-col gap-2.5 overflow-y-auto">
        {/* <SuccessBlock eyebrow={null}>SATMAP7 v1.0 is stable.</SuccessBlock> */}

        <TextBlock eyebrow="1. Application Hierarchy">
          <>
            <p>A hierarchical overview of SATMAP7's codebase.</p>
            <br />

            <p>1.1 SATMAP7 HIERARCHY</p>
            <br />
            <div>
              <p>
                SATMAP7's implementation is intentionally broken down into 6
                layers of abstraction. Each layer is listed below. The remaining
                sections 2-7 of the documentation delves into each abstraction
                layer in more depth.
              </p>
              <br />

              <div className="p-2.5">
                <ol className="pl-7.5 list-decimal">
                  <li>UI/HUD Layer (section 2)</li>
                  <li>State Layer (section 3)</li>
                  <li>Graphics Layer (section 4)</li>
                  <li>Controller Layer (section 5)</li>
                  <li>Data Layer (section 6)</li>
                  <li>Types Layer (section 7)</li>
                </ol>
                <br />
              </div>

              <p>
                This documentations page is both a user manual and project
                blueprint.
              </p>
              <br />
            </div>
          </>
        </TextBlock>

        <TextBlock eyebrow="2. UI/HUD Layer">
          <>
            <p>A manual on SATMAP7's tracker UI layout.</p>
            <br />

            <p>2.1 DESKTOP LAYOUT</p>
            <br />
            <div>
              <p>
                On desktop, the HUD overlay features a double-panel UI for both
                the default exploration mode and satellite selection mode. The
                exploration mode is engaged the moment that the user opens the
                tracker page. The satellite selection mode is engaged when a
                user selects a satellite for more detailed information.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  2.1.1 In the default mode, the left panel displays
                  application-specific statistics - this panel is called the
                  Stats Bar. The right panel is the Category Side Bar, which
                  renders the list of artificial constellations this application
                  tracks. There are 7 constellations as of v1.0. Selecting or
                  deselecting an artificial constellation list item toggles its
                  visibility in the scene.
                </p>
                <br />

                <p>
                  2.1.2 Selecting a satellite enteres the satellite-selection
                  mode. Entering satellite selection mode triggers both a HUD
                  overlay change and camera reposition animation. More on the
                  camera reposition animation shortly. The transition to the
                  satellite selection HUD is immediate. The left side panel
                  features key satellite statistics - this panel is called the
                  Satellite Information Panel. The right panel features
                  satellite media information, including a satellite-specific
                  descriptor and constellation-specific image file - this panel
                  is called the Satellite Media Panel.
                </p>
                <br />

                <p className="text-[10px]">
                  Note: The camera reposition animation is a simple
                  interpolation animation that runs every animation frame until
                  either a threshold distance is reached or user controls
                  preemptively override and terminate the interpolation
                  sequence.
                </p>
                <br />
              </div>
            </div>

            <p>2.2 TABLET/MOBILE LAYOUT</p>
            <br />
            <div>
              <p>
                In mobile or tablet view, the HUD overlay design, for both
                default and selection mode, changes entirely to a minimal
                toolbox kit design in order to free up screen estate as much as
                possible. All of the same panels from desktop are still
                available in the mobile toolbox-kit design. Depending on the
                mode, simply select the desired toolbox on the left hand side of
                the screen to display the desired panel component overlayed on
                top of the scene.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  2.2.1 Default Mode Toolbox Kit: There are 3 toolboxes in the
                  default mode. From top to bottom, they correspond to: Stats
                  Panel (application-level information), Category Panel (toggle
                  artificial constellations), and Control Hints panel. Note that
                  desktop control hints are already available in the left Bottom
                  Bar for a desktop viewport.
                </p>
                <br />

                <p>
                  2.2.2 Selection Mode Toolbox Kit: There are 4 toolboxes in the
                  selection mode. From to bottom, they correspond to: Satellite
                  Information Panel (satellite-level meta data), Satellite Media
                  Panel (high-level descriptors), Category Panel, and Control
                  Hints Panel. As you may have noticed, the Category Panel and
                  Control Hints Panel are available as toolboxes for both modes
                  in the mobile viewport.
                </p>
                <br />
              </div>
            </div>

            <p>2.3 SHARED COMPONENTS</p>
            <br />
            <div>
              <p>
                In all viewports (desktop, tablet, mobile) there are 3 primary
                HUD overlay components that persist without a major design
                change. They are the Orbital Trail Controls, Search Bar, and
                Deselection Chip.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  2.3.1 Orbit Trail Conrols: The orbital controls have 4
                  options: None, History, Full Orbit, and Both. They regard the
                  rendering of a polyline that visualize a satellite's
                  historical and/or predicted path through space. The orbital
                  line(s) are only rendered once a satellit is selected, during
                  satellite selection mode. The History line draws the selected
                  satellite's path during the last 90 minutes. The Full Orbit
                  lines draws the satellite's predicted path forward in time to
                  complete a full orbital period around the Earth.
                </p>
                <br />
                <p>
                  2.3.2 Search Bar: The search bar enables you to search for a
                  satellite by either its satellite name or NORAD ID. Selecting
                  a satellite from the search bar dropdown menu enters the
                  satellite selection mode. And naturally, as discussed in
                  section 2.1.2 and/or 2.2.2, this doubly triggers both a camera
                  reposition animation and HUD overlay change. The camera
                  reposition animation centers your view onto the selected
                  satellite.
                </p>
                <br />
                <p>
                  2.3.3 Deselection Chip: The deselection chip is located at the
                  top right hand side of the scene for all viewports. It renders
                  when you are in the satellite-selection mode. Selecting the
                  deselection chip exits the satellite selection mode and
                  returns you to the default exploration mode. In desktop, You
                  may also return to the default mode by clicking the "X" icon
                  located in the header of the left Satellite Information Side
                  Bar. For mobile or tablet, it is the only way to exit the
                  satellite selection mode.
                </p>
                <br />
              </div>
            </div>
          </>
        </TextBlock>

        <TextBlock eyebrow="3. State Layer">
          <>
            <p>A blueprint of SATMAP7's state management.</p>
            <br />

            <p>3.1 GLOBAL STATE MANAGEMENT</p>
            <br />
            <div>
              <p>
                All shared state lives in a single Zustand store. Any component
                can read any field without prop drilling, and any component can
                write to it.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  3.1.1 Satellite records are stored per category. Each of the 7
                  categories holds its own record array, visibility flag, and
                  load status. The tracker requests every category once on
                  mount, and each response is written into the store.
                </p>
                <br />

                <p>
                  3.1.2 Propagated positions are held in a separate map, keyed
                  by NORAD ID. The map is rewritten on every propagation tick
                  and carries the live position, altitude, and velocity of each
                  loaded satellite. The HUD panels read their numbers from here.
                </p>
                <br />

                <p>
                  3.1.3 The rest is interface state: the selected satellite, the
                  hovered satellite, the orbital trail mode, the search query
                  and results, and panel visibility. Keeping selection in the
                  store is what lets the search bar, the info panel, and the
                  scene agree without passing props between them.
                </p>
                <br />

                <p>
                  3.1.4 Components subscribe to single fields, not to the whole
                  store. A component that reads the hovered satellite re-renders
                  when the hovered satellite changes and at no other time. This
                  matters because some fields update at a high rate.
                </p>
                <br />

                <p className="text-[10px]">
                  NOTE: the propagated map is the deliberate exception. It is
                  rewritten twice a second, so components that need one position
                  read it directly instead of subscribing. Subscribing would
                  re-render the entire scene on every tick.
                </p>
                <br />
              </div>
            </div>

            <p>3.2 LOCAL STATE MANAGEMENT</p>
            <br />
            <div>
              <p>
                Anything only one component needs stays inside that component.
                The store is reserved for state that is genuinely shared.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  3.2.1 Geometry buffers are local. Each category builds its own
                  position and color buffers and writes new coordinates straight
                  into them. These are GPU data, not application state, and
                  nothing outside the component reads them.
                </p>
                <br />

                <p>
                  3.2.2 Values that change every frame are held in refs rather
                  than state. A ref can be updated without causing a re-render,
                  which is what lets the scene redraw on the animation frame
                  instead of the React render cycle.
                </p>
                <br />
              </div>
            </div>
          </>
        </TextBlock>

        <TextBlock eyebrow="4. Graphics Layer">
          <>
            <p>An outline of the 3D graphics scene implementation.</p>
            <br />

            <p>4.1 EARTH TEXTURE SHADERS</p>
            <br />
            <div>
              <p>
                The Earth is one sphere drawn with a custom shader, wrapped in a
                second sphere that produces the atmosphere.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  4.1.1 Two NASA textures are loaded, one daylit and one
                  nighttime. The shader picks between them using the angle
                  between the surface and a fixed sun direction, fading across
                  the terminator rather than cutting a hard line. City lights on
                  the night side are brightened, and the day side carries a
                  faint specular highlight over the oceans.
                </p>
                <br />

                <p>
                  4.1.2 The atmosphere is a second sphere, two percent larger,
                  rendered inside-out so only its rim is visible behind the
                  planet. Rim brightness is driven by viewing angle, tinted
                  blue where the sun hits and darker on the night side.
                </p>
                <br />

                <p>
                  4.1.3 A latitude and longitude grid is drawn every 30 degrees,
                  sitting just above the surface so it never fights the texture
                  for depth.
                </p>
                <br />
              </div>
            </div>

            <p>4.2 SATELLITE PROPAGATION</p>
            <br />
            <div>
              <p>
                Every category is drawn as a single points object. All of its
                satellites live in one buffer and reach the GPU in one draw
                call.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  4.2.1 Positions are rewritten twice a second, not every frame.
                  The buffer is flagged as changed and uploaded before the next
                  draw. Frames in between redraw the same data.
                </p>
                <br />

                <p>
                  4.2.2 Each point is shaded individually rather than filled
                  with one flat color. The shader draws a solid center, a
                  blown-out pinpoint, a thin surround, and a four-point cross,
                  which is what gives a satellite the look of a distant star.
                </p>
                <br />

                <p>
                  4.2.3 Point size shrinks with distance the way a real object
                  would, but is clamped at both ends. The floor keeps far
                  satellites from falling below a single pixel and vanishing.
                  The ceiling keeps near ones from swelling into blobs.
                </p>
                <br />

                <p className="text-[10px]">
                  NOTE: the bounding sphere is set by hand, once, to a fixed
                  radius wide enough to contain geostationary orbit. Three
                  normally recomputes it whenever vertices move, which would
                  mean walking every satellite twice a second for no benefit.
                </p>
                <br />
              </div>
            </div>

            <p>4.3 ORBIT CONTROLS</p>
            <br />
            <div>
              <p>
                Camera movement uses standard orbit controls with panning
                disabled, so the Earth stays centered no matter how the user
                drags. Zoom is clamped between just above the surface and far
                enough out to see geostationary orbit in frame. Damping is
                enabled, so movement carries a little momentum instead of
                stopping dead.
              </p>
              <br />
            </div>

            <p>4.4 SATELLITE SELECTION ANIMATION</p>
            <br />
            <div>
              <p>
                Selecting a satellite flies the camera to it. The animation is
                deliberately simple and always interruptible.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  4.4.1 The destination is a point in the same direction as the
                  satellite, half a unit further out from the center of the
                  Earth. This frames the satellite without putting the camera
                  inside it.
                </p>
                <br />

                <p>
                  4.4.2 Each frame the camera moves a fraction of the remaining
                  distance. That fraction is scaled by frame time, so the flight
                  takes the same duration on a slow machine as on a fast one.
                  The animation ends once the camera is within a small threshold
                  of the destination.
                </p>
                <br />

                <p>
                  4.4.3 Any user input cancels it immediately. The controller
                  listens for the moment the user grabs the controls and drops
                  the animation on the spot, so the camera never fights the
                  person driving it.
                </p>
                <br />
              </div>
            </div>

            <p>4.5 STARFIELD BACKGROUND</p>
            <br />
            <div>
              <p>
                The background is 6000 points scattered across a spherical shell
                far outside the scene, each at a random distance and a random
                brightness. Nothing else in the scene reaches that far out, so
                the starfield never intersects the Earth or the satellites.
              </p>
              <br />
            </div>
          </>
        </TextBlock>

        <TextBlock eyebrow="5. Controller Layer">
          <>
            <p>Propagation logic, search logic, TLE parsing, and more.</p>
            <br />

            <p>5.1 PROPAGATION</p>
            <br />
            <div>
              <p>
                Propagation runs entirely on the client, using SGP4. It takes
                the two TLE lines and a moment in time, and returns where the
                satellite is at that moment.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  5.1.1 The two TLE lines have to be parsed into the internal
                  form SGP4 works with before anything can be computed. That
                  parse is expensive and the result never changes, so it is done
                  once per satellite and kept for the rest of the session.
                  Computing a position from it is cheap by comparison.
                </p>
                <br />

                <p>
                  5.1.2 SGP4 returns coordinates in an Earth-centered frame that
                  treats Z as up. Three treats Y as up, so the axes are swapped
                  and the whole result is scaled down until the radius of the
                  Earth equals exactly 1.0. The scene is built around that unit.
                </p>
                <br />

                <p>
                  5.1.3 Latitude, longitude, and altitude need one more input:
                  how far the Earth has rotated at that instant. That angle is
                  Greenwich Mean Sidereal Time, computed for the same timestamp
                  and used to convert the position into ground coordinates.
                  Velocity is the length of the velocity vector SGP4 returns
                  alongside the position.
                </p>
                <br />

                <p>
                  5.1.4 Orbit trails reuse the same routine, just called
                  repeatedly. A history trail steps backward 90 minutes in 30
                  second intervals. A full orbit steps forward one orbital
                  period in 60 second intervals, where the period is derived
                  from how many revolutions per day the TLE reports.
                </p>
                <br />

                <p className="text-[10px]">
                  NOTE: a satellite that fails to propagate returns nothing and
                  is skipped rather than crashing the frame. This is the source
                  of the record alignment issue described in section 8.2.
                </p>
                <br />
              </div>
            </div>

            <p>5.2 SEARCH</p>
            <br />
            <div>
              <p>
                Search runs on the server. The client sends the query to an API
                route and renders whatever comes back.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  5.2.1 Queries under two characters return nothing without
                  doing any work. Typing is debounced on the client, so a query
                  is only sent once the user pauses.
                </p>
                <br />

                <p>
                  5.2.2 The route pulls all 7 categories out of the cache,
                  fetching any that are missing, and flattens them into one
                  list. A satellite matches if the query appears in its name,
                  its NORAD ID, or its international designator. Results are
                  capped at 50.
                </p>
                <br />

                <p>
                  5.2.3 Every result set is cached for 5 minutes under the query
                  string itself. Repeated searches for the same term skip the
                  flattening and filtering entirely.
                </p>
                <br />
              </div>
            </div>

            <p>5.3 TLE PARSING</p>
            <br />
            <div>
              <p>
                CelesTrak returns plain text, three lines per satellite: the
                name, then the two TLE lines.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  5.3.1 Fields are read by column position, not by splitting on
                  spaces. TLE is a fixed-width format inherited from punch
                  cards, and the columns are the specification. Splitting on
                  whitespace would break on any field that happens to be blank
                  or negative.
                </p>
                <br />

                <p>
                  5.3.2 The first line carries the NORAD catalog number, the
                  international designator, and the epoch. The epoch is written
                  as a two digit year followed by a fractional day of the year,
                  so it has to be rebuilt into a real date. By convention years
                  00 through 56 mean the 2000s and 57 through 99 mean the 1900s.
                </p>
                <br />

                <p>
                  5.3.3 The second line carries the orbital elements themselves:
                  inclination, right ascension of the ascending node,
                  eccentricity, argument of perigee, mean anomaly, and mean
                  motion. Eccentricity is stored without its leading zero and
                  decimal point, which have to be put back before the number
                  means anything.
                </p>
                <br />

                <p>
                  5.3.4 Anything missing a NORAD ID, an epoch, or either TLE
                  line is dropped. A partial record cannot be propagated, so
                  there is no reason to carry it further.
                </p>
                <br />

                <p className="text-[10px]">
                  NOTE: CelesTrak also offers a JSON format, which SATMAP7 does
                  not use. The JSON response gives the orbital elements as
                  separate fields but omits the raw TLE lines, and SGP4 needs
                  those lines directly.
                </p>
                <br />
              </div>
            </div>
          </>
        </TextBlock>

        <TextBlock eyebrow="6. Data Layer">
          <>
            <p>Fetching, Caching, and Data Processing</p>
            <br />

            <p>6.1 CACHING PROTOCOL</p>
            <br />

            <p>
              SATMAP7 features multi-layer caching in order to improve user
              experience and avoid overloading external servers. Section 6
              briefly outlines some of the caching decisions made for v1.0.
            </p>
            <br />

            <div className="p-2.5">
              <p>
                6.1.1 In order to avoid 403 and 503 errors, SATMAP7 caches
                satellite records with a TTL of 30 minutes. CelesTrak is
                therefore contacted at most once per category per half hour, or
                at most 14 times an hour across all 7 categories. The cache is
                what keeps traffic to CelesTrak proportional to the number of
                categories rather than the number of visitors.
              </p>
              <br />

              <p className="text-[10px]">
                NOTE: a TLE refreshed every 30 minutes is fine for educative
                purposes but is not suitable for high-precision tracking such as
                a collision prediction system.
              </p>
              <br />

              <p>
                6.1.2 Satellite-specific semantic descriptors are cached with a
                TTL of a week on Redis. In a future revision, they may be cached
                indefinitely to reduce latency. Other media data are not cached
                but are either stored on SATMAP7's own server (Earth texture
                images) or encoded as indefinite hardcoded links
                (constellation-specific WikiMedia files).
              </p>
              <br />

              <p>
                6.1.3 Search results are also cached on Redis but with a brief
                TTL of 5 minutes. Caching search results are necessary because
                all relevant search operations are executed on SATMAP7's server.
                This includes fetching records from Redis (or CelesTrak),
                reconstructing the dataset, and then applying the string search
                filter. In a future revision such as v1.1, some of the relevant
                search operations may be moved to the client end in order to
                mitigate the possibility of some record alignment catastrophes.
                See below.
              </p>
              <br />

              <p className="text-[#fb923c] text-[11px]">
                NOTICE: SATMAP7 v1.0 is theoretically prone to a server-client
                satellite record misalignment bug. If redis or zustand records
                are ever misaligned then searching could fail or lead to
                undefined behaviours. i.e., Redis fetches new data from
                CelesTrak but drops a satellite. Zustand persists and has
                satellite that same satellite still in the store. Then a user
                searching for the satellite record won't find it in the search
                results despite it's existence on the tracker.
              </p>
              <br />

              <p className="text-[#fb923c] text-[11px]">
                A more malevolent possibility can occur if Zustand fails. i.e.,
                Redis has complete, well-formed data but Zustand drops a
                satellite record. Then when a user searches for a dropped
                satellite record, the result appears on the server but not on
                Zustand (the tracker).
              </p>
              <br />
            </div>

            <p>6.2 DATA FETCHING</p>
            <br />
            <div>
              <p>
                All satellite data comes from the CelesTrak GP API, one request
                per category, requested as plain TLE text.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  6.2.1 Each of the 7 categories maps to a named CelesTrak
                  group. Starlink, OneWeb, and the space stations map to groups
                  of the same name. Navigation maps to the GPS operational
                  group, debris to a specific collision debris field, and Other
                  Active to the full active satellite catalog.
                </p>
                <br />

                <p>
                  6.2.2 Every category has a record cap, and a second global cap
                  can lower all of them at once from the environment. The full
                  active catalog alone is over 12000 objects, far more than the
                  scene needs and far more than a browser should be asked to
                  propagate twice a second.
                </p>
                <br />

                <p>
                  6.2.3 Requests are checked against three caches in order: the
                  framework fetch cache, Redis, and an in-memory fallback used
                  when Redis is not configured. Only a miss on all three reaches
                  CelesTrak. A non-success response throws, and the API route
                  answers with a 502.
                </p>
                <br />

                <p>
                  6.2.4 The tracker requests all 7 categories in parallel the
                  moment the scene mounts. Categories arrive independently and
                  render as they land, so the globe fills in rather than waiting
                  on the slowest response.
                </p>
                <br />

                <p className="text-[#fb923c] text-[11px]">
                  NOTICE: SATMAP7 v1.0 has no stale fallback. If CelesTrak is
                  unreachable and nothing is cached, the route returns an error
                  and that constellation renders nothing. The failure is also
                  silent, since a failed load is stored but never surfaced in
                  the HUD, so an outage looks identical to an empty sky. A
                  long-lived last-known-good copy is planned for v1.1.
                </p>
                <br />
              </div>
            </div>

            <p>6.3 DATA NORMALIZATION</p>
            <br />
            <div>
              <p>
                Parsed TLE data is converted into one flat record shape before
                it leaves the server. Everything downstream reads that shape and
                nothing else.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  6.3.1 CelesTrak names its fields in upper case with
                  underscores. Normalization renames them, keeps only the fields
                  the application actually uses, and fills in defaults for the
                  ones CelesTrak omits from the TLE format.
                </p>
                <br />

                <p>
                  6.3.2 A record missing either TLE line, a NORAD ID, or an
                  epoch is discarded here rather than downstream. None of those
                  can be reconstructed, and a record without them cannot be
                  propagated or identified.
                </p>
                <br />

                <p>
                  6.3.3 Normalization is also the cap boundary. Records are
                  accumulated until the category limit is reached and the rest
                  are ignored, so the array written to Redis is already the size
                  the client will receive.
                </p>
                <br />

                <p className="text-[10px]">
                  NOTE: an intermediate type still sits between the raw TLE and
                  the final record. It exists only because the JSON format was
                  the original data source, and it is marked for removal in
                  v2.0.
                </p>
                <br />
              </div>
            </div>
          </>
        </TextBlock>

        <TextBlock eyebrow="7. Types Layer">
          <>
            <p>The definitions of SATMAP7.</p>
            <br />

            <p>7.1 TYPES OVERVIEW</p>
            <br />
            <div>
              <p>
                Every shared type in SATMAP7 lives in one file. Nothing is
                declared locally and duplicated, so a change to a shape breaks
                at compile time everywhere it matters.
              </p>
              <br />

              <div className="p-2.5">
                <p>
                  7.1.1 The satellite record is the central type. It carries the
                  NORAD ID, name, international designator, category, both TLE
                  lines, and a few orbital elements kept for display. This is
                  the shape written to Redis and the shape sent to the client.
                </p>
                <br />

                <p>
                  7.1.2 The propagated satellite extends that record rather than
                  replacing it, adding scene position, latitude, longitude,
                  altitude, and velocity. Anything holding a propagated
                  satellite also holds the full record, which is why the HUD
                  panels can render identity and position from a single object.
                </p>
                <br />

                <p>
                  7.1.3 The category type is a fixed union of the 7
                  constellations. It is not a plain string, so a typo in a
                  category name fails to compile instead of silently returning
                  nothing at runtime.
                </p>
                <br />

                <p>
                  7.1.4 Category metadata is stored beside the union: display
                  label, color in two forms, the matching CelesTrak group name,
                  and a record cap. Adding a constellation is mostly a matter of
                  extending the union and adding one entry here. A separate map
                  holds one representative image per category.
                </p>
                <br />

                <p>
                  7.1.5 The API responses are typed as well, one shape per
                  route. Trail types round out the file: the four trail modes as
                  a union, and a trail point as a position with a timestamp.
                </p>
                <br />

                <p className="text-[10px]">
                  NOTE: one deprecated type remains, an intermediate shape in
                  the upper case field names CelesTrak uses. It is a holdover
                  from the JSON format and is scheduled for removal in v2.0, at
                  which point parsed TLE data will populate the satellite record
                  directly.
                </p>
                <br />
              </div>
            </div>
          </>
        </TextBlock>

        <TextBlock eyebrow="8. Application Status">
          <>
            <p>Version control logs.</p>
            <br />

            <p>8.1 Status</p>
            <br />
            <div className="p-2.5">
              <p className="text-[#39ff14] text-[11px]">
                STATUS: SATMAP7 v1.0 is stable.
              </p>
              <br />
            </div>

            <p>8.2 Developer Notes</p>
            <br />
            <div className="p-2.5">
              <p className="text-[#fb923c] text-[11px]">
                NOTICE: SATMAP7 v1.0 is theoretically prone to a client-only
                satellite record misalignment bug. A satellite record may be
                dropped in the rare event of a propagation calculation error.
                This error has never occurred in practice, and would generally
                need to be induced manually. Nevertheless, a preemptive patch
                will be deployed in an upcoming v1.1 update.
              </p>
              <br />
            </div>
          </>
        </TextBlock>
      </div>
    </div>
  );
};

export default DocsPage;
