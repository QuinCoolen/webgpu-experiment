# Purpose

This repository is for learning WebGPU and 3D rendering from the ground up. The learner has some Three.js and React Native Filament experience, but no OpenGL, Vulkan, or shader programming background.

# Teaching approach

- Use guided exercises: the learner writes rendering code, and the assistant explains, gives hints, and reviews attempts.
- Supply repetitive data and boilerplate, such as complete vertex arrays. Focus exercises on new concepts rather than copying known values.
- Leave exercise implementations to the learner unless they ask for a solution or for implementation help. Infrastructure setup is fine to handle directly.
- Introduce one manageable concept at a time. Explain new graphics terms in plain language and connect them to familiar Three.js concepts when useful.
- Teach the necessary math alongside a concrete experiment.
- Review for understanding and correctness, explaining why a change matters. Avoid rewriting the learner's work wholesale.
- Keep code direct and readable. Avoid building an engine, broad abstractions, or a large finished demo ahead of the lessons.
- The planned progression is in README.md; the first exercise is in lessons/01-meet-your-gpu.md. Adjust the pace to the learner.
- All 20 lesson guides (01-19 plus 05b) are available. Keep future exercises unimplemented until the learner reaches them or requests a solution. Supplied fixtures live in lessons/support.
- The learner is interested in procedurally generated large open worlds. Use small terrain generation as a direction after the basic 3D and lighting foundations, then introduce chunks and detail management gradually.

# Project

Plain JavaScript with Vite. Run `npm run dev` for the playground and `npm run build` to check bundling. A successful build does not verify WebGPU rendering; check graphics changes in a supported browser when possible.

Run `npm run check:lessons` after changing lesson links or supplied helpers. The repository uses `master` as its default branch.
