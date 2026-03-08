import { nanoid } from "nanoid";
import { createBlock } from "../registry/blockRegistry";
import type { DocTemplate } from "../types/blocks";

function blkId() {
  return `blk_${nanoid(8)}`;
}

const now = Date.now();

export const starterTemplates: DocTemplate[] = [
  // --- Invoice Template ---
  {
    id: nanoid(),
    name: "Standard Invoice",
    type: "invoice",
    description: "Professional invoice with line items, totals, and payment details",
    blocks: [
      {
        id: blkId(),
        type: "document-header",
        props: {
          companyName: "{{company.name}}",
          documentTitle: "INVOICE",
          documentSubtitle: "{{company.tagline}}",
          layout: "logo-left",
        },
      },
      createBlock("address-pair"),
      {
        id: blkId(),
        type: "key-value-grid",
        props: {
          columns: 3,
          items: [
            { label: "Invoice #", value: "{{invoiceNumber}}" },
            { label: "Date", value: "{{invoiceDate}}" },
            { label: "Due Date", value: "{{dueDate}}" },
            { label: "PO Number", value: "{{poNumber}}" },
          ],
          layout: "bordered",
        },
      },
      {
        id: blkId(),
        type: "data-table",
        props: {
          each: "lineItems",
          columns: [
            { header: "Description", field: "description", align: "left" },
            { header: "Qty", field: "quantity", align: "center", format: "number" },
            { header: "Unit Price", field: "unitPrice", align: "right", format: "currency" },
            { header: "Amount", field: "amount", align: "right", format: "currency" },
          ],
          showIndex: false,
          zebraStripe: true,
          borderStyle: "full",
        },
      },
      {
        id: blkId(),
        type: "summary-table",
        props: {
          items: [
            { label: "Subtotal", value: "{{subtotal}}", format: "currency", style: "subtotal" },
            { label: "Tax", value: "{{tax}}", format: "currency", style: "normal" },
            { label: "Total", value: "{{total}}", format: "currency", style: "grand-total" },
          ],
          labelWidth: "70%",
          alignment: "right-aligned",
        },
      },
      createBlock("bank-details"),
      createBlock("terms-conditions"),
      createBlock("signature-block"),
      createBlock("document-footer"),
    ],
    sampleData: {
      company: {
        name: "Acme Trading Ltd",
        address: "123 Commerce St\nLondon EC1 1AA\nUnited Kingdom",
        tagline: "Quality goods since 2020",
      },
      customer: {
        name: "Global Imports Inc",
        address: "456 Trade Ave\nNew York, NY 10001\nUSA",
      },
      invoiceNumber: "INV-2024-001",
      invoiceDate: "2024-03-01",
      dueDate: "2024-03-31",
      poNumber: "PO-7890",
      lineItems: [
        { description: "Widget A", quantity: 10, unitPrice: 25.0, amount: 250.0 },
        { description: "Widget B", quantity: 5, unitPrice: 50.0, amount: 250.0 },
        { description: "Service Fee", quantity: 1, unitPrice: 75.0, amount: 75.0 },
      ],
      subtotal: 575.0,
      tax: 57.5,
      total: 632.5,
      bank: {
        name: "First National Bank",
        accountNumber: "12345678",
        sortCode: "12-34-56",
        iban: "GB82WEST12345698765432",
      },
      pageNumber: 1,
    },
    createdAt: now,
    updatedAt: now,
  },

  // --- Booking Confirmation Template ---
  {
    id: nanoid(),
    name: "Booking Confirmation",
    type: "confirmation",
    description: "Multi-booking confirmation with optional special requests",
    blocks: [
      {
        id: blkId(),
        type: "document-header",
        props: {
          companyName: "{{company.name}}",
          documentTitle: "BOOKING CONFIRMATION",
          layout: "logo-left",
        },
      },
      createBlock("address-block"),
      {
        id: blkId(),
        type: "key-value-grid",
        props: {
          columns: 2,
          items: [
            { label: "Booking ID", value: "{{bookingId}}" },
            { label: "Date", value: "{{confirmationDate}}" },
            { label: "Status", value: "{{status}}" },
          ],
          layout: "bordered",
        },
      },
      {
        id: blkId(),
        type: "conditional",
        props: {
          expression: "showSpecialRequests",
          operator: "if",
          label: "Special Requests",
        },
        children: [
          {
            id: blkId(),
            type: "section-heading",
            props: { title: "Special Requests", level: 2, underline: true },
          },
          {
            id: blkId(),
            type: "text-block",
            props: {
              content: "{{specialRequests}}",
              fontSize: "sm",
              textStyle: "normal",
              textAlign: "left",
            },
          },
        ],
      },
      {
        id: blkId(),
        type: "loop",
        props: {
          each: "bookings",
          itemAlias: "booking",
          indexAlias: "idx",
          label: "Booking details",
        },
        children: [
          {
            id: blkId(),
            type: "section-heading",
            props: {
              title: "{{booking.title}}",
              level: 3,
              underline: true,
            },
          },
          {
            id: blkId(),
            type: "key-value-grid",
            props: {
              columns: 2,
              items: [
                { label: "Reference", value: "{{booking.reference}}" },
                { label: "Date", value: "{{booking.date}}" },
                { label: "Amount", value: "{{booking.amount}}" },
              ],
              layout: "minimal",
            },
          },
        ],
      },
      createBlock("document-footer"),
    ],
    sampleData: {
      company: {
        name: "TravelCo Ltd",
        address: "789 Holiday Lane\nLondon SW1 1AA",
      },
      customer: {
        name: "John Smith",
        address: "10 Customer Rd\nManchester M1 1AA",
      },
      bookingId: "BC-2024-042",
      confirmationDate: "2024-03-08",
      status: "Confirmed",
      showSpecialRequests: true,
      specialRequests:
        "Please ensure early check-in if possible. Vegetarian meal preference.",
      bookings: [
        {
          title: "Hotel Stay",
          reference: "HTL-001",
          date: "2024-04-15",
          amount: "£450.00",
        },
        {
          title: "Flight",
          reference: "FLT-002",
          date: "2024-04-14",
          amount: "£320.00",
        },
      ],
      pageNumber: 1,
    },
    createdAt: now,
    updatedAt: now,
  },

  // --- Voucher Template ---
  {
    id: nanoid(),
    name: "Gift Voucher",
    type: "voucher",
    description: "Simple voucher with code and redemption terms",
    blocks: [
      {
        id: blkId(),
        type: "document-header",
        props: {
          companyName: "{{company.name}}",
          documentTitle: "GIFT VOUCHER",
          documentSubtitle: "Redeem at any participating location",
          layout: "centered",
        },
      },
      {
        id: blkId(),
        type: "section-heading",
        props: { title: "Voucher Details", level: 2, underline: true },
      },
      {
        id: blkId(),
        type: "key-value-grid",
        props: {
          columns: 2,
          items: [
            { label: "Voucher Code", value: "{{voucherCode}}" },
            { label: "Valid Until", value: "{{validUntil}}" },
            { label: "Amount", value: "{{amount}}" },
          ],
          layout: "bordered",
        },
      },
      {
        id: blkId(),
        type: "text-block",
        props: {
          content:
            "Terms: This voucher is non-refundable and cannot be exchanged for cash. Valid for one-time use only. Subject to availability.",
          fontSize: "xs",
          textStyle: "legal",
          textAlign: "left",
        },
      },
      createBlock("document-footer"),
    ],
    sampleData: {
      company: {
        name: "Retail Rewards Inc",
        address: "100 Voucher Way\nLondon E1 1AA",
      },
      voucherCode: "GIFT-2024-XYZ789",
      validUntil: "2024-12-31",
      amount: "£100.00",
      pageNumber: 1,
    },
    createdAt: now,
    updatedAt: now,
  },
];
