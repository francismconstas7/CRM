import { Solopreneur, Client, Invoice, FollowUp } from './types';

export const INITIAL_SOLOPRENEUR: Solopreneur = {
  businessName: "Apex Craft & Repairs",
  whatsappTemplate: "Hi {{client_name}}, hope you're doing well! Just a friendly reminder that a payment of ${{amount}} is due on {{due_date}} for our services. You can pay via Venmo/Zelle. Thank you! - Apex",
  smsTemplate: "Hello {{client_name}}, this is Apex. Following up on our schedule for ${{amount}} due on {{due_date}}. Let me know if that works for you!"
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: "c-1",
    name: "John Miller",
    phone: "+1555019283",
    email: "john.miller@example.com",
    notes: "Requires weekend availability. Prefers text over calls. Completed living room faucet repair.",
    status: "Active",
    createdAt: "2026-04-10"
  },
  {
    id: "c-2",
    name: "Sarah Davis",
    phone: "+1555014839",
    email: "sarah.davis@example.com",
    notes: "Tutor client - kids math tuition. Prefers monthly billing on 15th.",
    status: "Active",
    createdAt: "2026-04-15"
  },
  {
    id: "c-3",
    name: "Robert Chen",
    phone: "+1555017245",
    email: "robert.c@example.com",
    notes: "Kitchen shelf installation. Demands detailed itemized receipts.",
    status: "Active",
    createdAt: "2026-05-01"
  },
  {
    id: "c-4",
    name: "Emily Watson",
    phone: "+1555012391",
    email: "emily.w@example.com",
    notes: "Lawn mowing and landscaping custom request. Signed recurring contract.",
    status: "Active",
    createdAt: "2026-05-10"
  },
  {
    id: "c-5",
    name: "Marcus Brody",
    phone: "+1555018374",
    email: "m.brody@example.com",
    notes: "Stained glass door repair. Antique framing care required.",
    status: "Inactive",
    createdAt: "2026-01-12"
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "i-1",
    clientId: "c-1",
    amount: 180,
    status: "Overdue",
    dueDate: "2026-05-15", // Overdue by a few days from May 21
    description: "Living room faucet plumbing repair & parts"
  },
  {
    id: "i-2",
    clientId: "c-2",
    amount: 320,
    status: "Paid",
    dueDate: "2026-05-15",
    description: "Algebra and geometry prep tutoring - 4 sessions"
  },
  {
    id: "i-3",
    clientId: "c-3",
    amount: 450,
    status: "Overdue",
    dueDate: "2026-05-10", // Heavily overdue
    description: "Custom kitchen floating oak shelves"
  },
  {
    id: "i-4",
    clientId: "c-4",
    amount: 120,
    status: "Pending",
    dueDate: "2026-05-25", // Upcoming due date
    description: "Garden cleanup and fertilizer seeding"
  }
];

export const INITIAL_FOLLOWUPS: FollowUp[] = [
  {
    id: "f-1",
    clientId: "c-1",
    date: "2026-05-21", // Due today
    description: "Check if faucet is leak-free and send final receipt link",
    completed: false
  },
  {
    id: "f-2",
    clientId: "c-3",
    date: "2026-05-21", // Due today
    description: "Ask Robert for feedback on floating shelves and confirm payment status",
    completed: false
  },
  {
    id: "f-3",
    clientId: "c-2",
    date: "2026-05-22", // Tomorrow
    description: "Prep trigonometry notes for next session",
    completed: false
  },
  {
    id: "f-4",
    clientId: "c-4",
    date: "2026-05-19", // Overdue follow-up
    description: "Verify if Emily received the customized design layout",
    completed: true
  }
];
