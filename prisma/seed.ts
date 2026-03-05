import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create system user for templates
  const systemUser = await prisma.user.upsert({
    where: { email: "system@lyons-form.internal" },
    update: {},
    create: {
      id: "template-system",
      email: "system@lyons-form.internal",
      name: "System",
      passwordHash: "not-a-real-hash",
    },
  });

  // Create Contact Form template
  const contactForm = await prisma.form.upsert({
    where: { slug: "template-contact-form" },
    update: {},
    create: {
      title: "Contact Form",
      description: "A simple contact form for collecting inquiries.",
      slug: "template-contact-form",
      status: "draft",
      isTemplate: true,
      userId: "template-system",
      styles: {
        background: { type: "gradient", color1: "#e0f2fe", color2: "#bae6fd", direction: "to bottom" },
        primaryColor: "#0284c7",
        fontFamily: "Inter",
        fontSize: "medium",
        button: { color: "#0284c7", borderRadius: "8px", text: "Submit" },
        container: { borderRadius: "12px", shadow: "md", padding: "32px", maxWidth: "640px" },
      },
      fields: {
        create: [
          { type: "text", label: "Name", placeholder: "Your full name", required: true, order: 0 },
          { type: "email", label: "Email", placeholder: "your@email.com", required: true, order: 1 },
          { type: "phone", label: "Phone", placeholder: "+1 (555) 000-0000", required: false, order: 2 },
          {
            type: "select",
            label: "Subject",
            placeholder: "Select a subject",
            required: true,
            order: 3,
            options: ["General Inquiry", "Support", "Feedback", "Other"],
          },
          { type: "textarea", label: "Message", placeholder: "How can we help you?", required: true, order: 4 },
        ],
      },
    },
  });

  // Create Event Registration template (without conditional logic first)
  const eventForm = await prisma.form.upsert({
    where: { slug: "template-event-registration" },
    update: {},
    create: {
      title: "Event Registration",
      description: "Collect attendee information for your event.",
      slug: "template-event-registration",
      status: "draft",
      isTemplate: true,
      userId: "template-system",
      styles: {
        background: { type: "gradient", color1: "#dcfce7", color2: "#bbf7d0", direction: "to bottom" },
        primaryColor: "#16a34a",
        fontFamily: "Inter",
        fontSize: "medium",
        button: { color: "#16a34a", borderRadius: "8px", text: "Register" },
        container: { borderRadius: "12px", shadow: "md", padding: "32px", maxWidth: "640px" },
      },
      fields: {
        create: [
          { type: "text", label: "Full Name", placeholder: "Your full name", required: true, order: 0 },
          { type: "email", label: "Email", placeholder: "your@email.com", required: true, order: 1 },
          { type: "phone", label: "Phone", placeholder: "+1 (555) 000-0000", required: false, order: 2 },
          { type: "text", label: "Organization", placeholder: "Company or organization", required: false, order: 3 },
          {
            type: "number",
            label: "Number of Attendees",
            placeholder: "1",
            required: true,
            order: 4,
            validationRules: { min: 1 },
          },
          {
            type: "checkbox",
            label: "Dietary Requirements",
            required: false,
            order: 5,
            options: ["None", "Vegetarian", "Vegan", "Gluten-free", "Other"],
          },
          {
            type: "textarea",
            label: "Special Accommodations",
            placeholder: "Any special requirements?",
            required: false,
            order: 6,
          },
          {
            type: "radio",
            label: "Do you need parking?",
            required: false,
            order: 7,
            options: ["Yes", "No"],
          },
          {
            type: "text",
            label: "Vehicle Plate Number",
            placeholder: "e.g. ABC-1234",
            required: false,
            order: 8,
          },
        ],
      },
    },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  // Set conditional logic with proper fieldId reference
  const parkingField = eventForm.fields.find((f) => f.label === "Do you need parking?");
  const plateField = eventForm.fields.find((f) => f.label === "Vehicle Plate Number");
  if (parkingField && plateField) {
    await prisma.formField.update({
      where: { id: plateField.id },
      data: {
        conditionalLogic: {
          fieldId: parkingField.id,
          operator: "equals",
          value: "Yes",
        },
      },
    });
  }

  console.log("Seeded templates:", { contactForm: contactForm.id, eventForm: eventForm.id });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
