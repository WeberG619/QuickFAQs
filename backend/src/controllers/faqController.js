const OpenAI = require('openai');
const FAQ = require('../models/FAQ');
const User = require('../models/User');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.generateFAQ = async (req, res) => {
  try {
    const { companyName, productDetails, category, tags } = req.body;
    
    // Construct the prompt for GPT
    const prompt = `
    Create a comprehensive FAQ section for the following company and product:
    
    Company Name: ${companyName}
    Product Details: ${productDetails}
    Category: ${category || 'General'}

    Generate 5-7 of the most relevant questions and detailed answers that potential customers might have.
    Format the output in a clear, professional manner with questions numbered and answers properly spaced.
    `;

    // Generate FAQ using OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are an expert at creating clear, professional FAQ sections that address key customer concerns."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1000
    });

    const generatedFAQ = completion.choices[0].message.content;

    // Save FAQ to database
    const faq = await FAQ.create({
      userId: req.user._id,
      companyName,
      productDetails,
      generatedFAQ,
      category: category || 'Other',
      tags: tags || []
    });

    // Deduct credit if user is not premium
    if (req.user.subscriptionStatus !== 'premium') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { faqCredits: -1 }
      });
    }

    res.json({
      faq: {
        id: faq._id,
        companyName: faq.companyName,
        generatedFAQ: faq.generatedFAQ,
        category: faq.category,
        tags: faq.tags,
        createdAt: faq.createdAt
      }
    });
  } catch (error) {
    console.error('FAQ generation error:', error);
    res.status(500).json({ message: 'Error generating FAQ' });
  }
};

exports.getUserFAQs = async (req, res) => {
  try {
    const { category, tags, search } = req.query;
    
    // Build query
    const query = { userId: req.user._id };
    
    if (category) {
      query.category = category;
    }
    
    if (tags && tags.length > 0) {
      query.tags = { $in: tags.split(',') };
    }
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { generatedFAQ: { $regex: search, $options: 'i' } }
      ];
    }

    const faqs = await FAQ.find(query)
      .sort({ createdAt: -1 })
      .select('companyName generatedFAQ customizedFAQ category tags createdAt lastModified');

    res.json({ faqs });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Error retrieving FAQs' });
  }
};

exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ faq });
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({ message: 'Error retrieving FAQ' });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { customizedFAQ, category, tags } = req.body;

    const faq = await FAQ.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    if (customizedFAQ !== undefined) {
      faq.customizedFAQ = customizedFAQ;
    }
    
    if (category) {
      faq.category = category;
    }
    
    if (tags) {
      faq.tags = tags;
    }

    await faq.save();

    res.json({ faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ message: 'Error updating FAQ' });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ message: 'Error deleting FAQ' });
  }
};
