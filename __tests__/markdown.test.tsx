import { render, screen, fireEvent } from "@testing-library/react";
import MarkdownEditor from "@/app/tools/markdown/page";
import "@testing-library/jest-dom";

// Mock ReactMarkdown
jest.mock("react-markdown", () => {
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => {
      // Simple implementation that just renders the markdown text in a div
      return <div data-testid="markdown-preview">{children}</div>;
    },
  };
});

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("MarkdownEditor", () => {
  const defaultMarkdown = `# Welcome to the Markdown Editor

This is a live preview of your Markdown.

## Features

- **Bold** and *italic* text
- [Links](https://justbuildthings.com)
- Lists:
  1. Ordered
  2. Unordered

\`\`\`
Code blocks
\`\`\`

> Blockquotes

Enjoy writing!`;

  beforeEach(() => {
    jest.clearAllMocks();
    render(<MarkdownEditor />);
  });

  it("renders the component with all necessary elements", () => {
    expect(screen.getByText("Markdown Editor")).toBeInTheDocument();
    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Copy Markdown")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write your markdown here...")
    ).toBeInTheDocument();
    expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
  });

  it("displays the default markdown in the editor", () => {
    const textarea = screen.getByPlaceholderText("Write your markdown here...");
    expect(textarea).toHaveValue(defaultMarkdown);
  });

  it("updates the preview when markdown is edited", () => {
    const textarea = screen.getByPlaceholderText("Write your markdown here...");
    const newMarkdown = "# New Header\n\nNew content";

    fireEvent.change(textarea, { target: { value: newMarkdown } });

    const preview = screen.getByTestId("markdown-preview");
    expect(preview).toHaveTextContent("# New Header New content");
  });

  it("shows character count", () => {
    // Default markdown length should be displayed
    expect(
      screen.getByText(`${defaultMarkdown.length} characters`)
    ).toBeInTheDocument();

    // Update markdown and check if character count updates
    const textarea = screen.getByPlaceholderText("Write your markdown here...");
    const newMarkdown = "# Short";

    fireEvent.change(textarea, { target: { value: newMarkdown } });

    expect(
      screen.getByText(`${newMarkdown.length} characters`)
    ).toBeInTheDocument();
  });
});
