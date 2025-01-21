import { jsPDF } from 'jspdf';

export const exportToMarkdown = (faq) => {
  const content = `# ${faq.companyName} - FAQ\n\n${faq.generatedFAQ}`;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${faq.companyName.toLowerCase().replace(/\s+/g, '-')}-faq.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (faq) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(faq.companyName, 20, 20);
  
  // Add FAQ content
  doc.setFontSize(12);
  const splitText = doc.splitTextToSize(faq.generatedFAQ, 170);
  doc.text(splitText, 20, 40);
  
  // Save the PDF
  doc.save(`${faq.companyName.toLowerCase().replace(/\s+/g, '-')}-faq.pdf`);
};
