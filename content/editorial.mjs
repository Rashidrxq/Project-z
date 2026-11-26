export const services = [
  {
    slug: 'web-platforms', world: 'Umbra', label: 'Web platforms', field: 'Product engineering',
    summary: 'One workspace for the people taking an order, making it, and sending it out.',
    title: ['Software for the', 'whole operation.'],
    lead: 'When a business runs on spreadsheets, the hard part is often the handoff. We build web applications around the decisions each person needs to make.',
    fit: 'A sales team promises a delivery date. Production works from a different sheet. Dispatch calls to ask which address is current. This is where a shared order record earns its place.',
    deliverables: [
      ['A working product slice', 'One complete journey, from the first input to the final handoff, that your team can try with realistic records.'],
      ['A shared data model', 'Roles, permissions, and a history of changes that keep teams working from the same facts.'],
      ['An operable release', 'Deployment configuration, checks for the critical paths, and a handover covering everyday support.']
    ],
    example: ['SalesOrder ERP', 'Explore the founder’s order-management project, from production to dispatch.', 'https://github.com/Rashidrxq/SalesOrder-ERP-REMEX']
  },
  {
    slug: 'workflow-automation', world: 'Pelagos', label: 'Workflow automation', field: 'Integration engineering',
    summary: 'Make routine handoffs automatic. Give the awkward exceptions a clear owner.',
    title: ['Let the routine', 'run itself.'],
    lead: 'We connect tools that already do their jobs well. Your team sees which work moved forward, which work stalled, and who can resolve it.',
    fit: 'A colleague copies the same order number into three systems. When one system times out, nobody knows whether to try again. We start by mapping that exact sequence.',
    deliverables: [
      ['A handoff map', 'An inventory of triggers, data owners, and decisions that need a person in the loop.'],
      ['A reliable integration', 'API connections with validation, duplicate handling, and recovery paths for interrupted runs.'],
      ['An exceptions queue', 'A review surface and runbook so the people doing the work can resolve a failed handoff.']
    ],
    example: ['Designing the handoff', 'Read our engineering note on requests that arrive twice.', '/insights/designing-the-handoff/']
  },
  {
    slug: 'immersive-web', world: 'Cinder', label: 'Immersive web', field: 'Creative engineering',
    summary: 'Interactive product stories with materials, lighting, and motion made for the browser.',
    title: ['Give an idea', 'a third dimension.'],
    lead: 'Some products are easier to understand when people can turn them over. We design interactive scenes around what a visitor needs to see or do.',
    fit: 'A product has an important detail that a front-on photograph hides. A visitor needs a close-up, an alternate view, and a way to keep reading on a slower phone.',
    deliverables: [
      ['A scene study', 'A storyboard and a working interaction study that settle the camera, framing, and gesture before production.'],
      ['A browser-ready scene', 'Models or procedural surfaces, custom materials, and a rendering budget agreed for the target devices.'],
      ['A still experience', 'Art-directed images and accessible navigation that retain the narrative when motion is reduced or 3D is unavailable.']
    ],
    example: ['The orbital atlas', 'Explore the three-world viewer and its custom rendering code.', 'https://github.com/Rashidrxq/Project-z']
  }
];

export const notes = [
  {
    slug: 'the-first-frame', category: 'Real-time graphics', title: 'The first frame is a design decision.',
    summary: 'How the Project Z atlas keeps its composition while the renderer starts.',
    intro: 'The atlas has three worlds, but it also has two ways to show each one. The still image is part of the design from the very first frame.',
    sections: [
      ['Start with a picture', 'On the home page, the first planet is an ordinary image with a fixed aspect ratio and descriptive text. The browser can paint it while the rendering code asks for a graphics device and loads the texture atlas. The heading, service link, and navigation are already usable.'],
      ['Match the camera', 'A fallback becomes conspicuous when the object jumps between two compositions. The atlas stills and live scene use the same sphere, inclined ring plane, and framing. That makes the switch feel like the world beginning to move.'],
      ['Budget for the slow frame', 'The renderer measures the time between frames and averages several samples before adjusting detail. When frames take longer, it lowers the canvas resolution and softens fine ring bands. When the tab is hidden, the animation pauses.'],
      ['Make the exit intentional', 'A visitor can choose still mode. Reduced-motion and data-saving preferences also select the poster on arrival. Destination controls keep their meaning in either mode, so reaching Pelagos never depends on dragging a canvas.']
    ],
    reference: ['Read the atlas source', 'https://github.com/Rashidrxq/Project-z']
  },
  {
    slug: 'designing-the-handoff', category: 'Systems design', title: 'What if the same order arrives twice?',
    summary: 'A practical design exercise for the space between sales and dispatch.',
    intro: 'Imagine a dispatch request succeeds, but the connection drops before the sales screen receives a reply. The operator presses the button again. What should the warehouse see?',
    sections: [
      ['Name the action', 'Give the original dispatch request a stable identifier. A retry of that request carries the same identifier. A genuinely new shipment gets a new one, even if it contains the same products. An order number alone cannot distinguish those cases.'],
      ['Record the decision', 'For a dispatch record stored locally, keep the request identifier and the resulting record together in one database transaction. A uniqueness constraint makes two concurrent attempts converge on one stored decision. A second caller can retrieve that decision.'],
      ['Plan for the boundary', 'A database transaction does not cover an external carrier. Where the carrier supports an idempotency key, pass the same identifier onward. Otherwise persist the outbound intent, keep the carrier reference, and reconcile ambiguous outcomes before sending again.'],
      ['Test the uncomfortable moment', 'Exercise a timeout after the carrier accepts the shipment and before the local confirmation is saved. The operator should see an explicit pending state and a way to reconcile it. The test passes when the shipment count and the visible status both tell the right story.']
    ],
    reference: ['Explore workflow automation', '/services/workflow-automation/']
  }
];
