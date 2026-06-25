const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const ExcelJS = require('exceljs');
const pool = require('../db');

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
}

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const admin = result.rows[0];
    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;

    res.json({ success: true, message: 'Login successful.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed.' });
    }
    res.json({ success: true, message: 'Logged out.' });
  });
});

// GET /api/admin/nominations
router.get('/nominations', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM nominations ORDER BY submitted_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching nominations:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/admin/stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    // Total nominations
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM nominations');
    const totalNominations = parseInt(totalResult.rows[0].count, 10);

    // Categories covered
    const categoriesResult = await pool.query('SELECT COUNT(DISTINCT category) as count FROM nominations');
    const categoriesCovered = parseInt(categoriesResult.rows[0].count, 10);

    // Today's submissions
    const todayResult = await pool.query(
      "SELECT COUNT(*) as count FROM nominations WHERE submitted_at::date = CURRENT_DATE"
    );
    const todaySubmissions = parseInt(todayResult.rows[0].count, 10);

    // Most nominated category
    const topCategoryResult = await pool.query(
      'SELECT category, COUNT(*) as count FROM nominations GROUP BY category ORDER BY count DESC LIMIT 1'
    );
    const topCategory = topCategoryResult.rows.length > 0 ? topCategoryResult.rows[0].category : 'N/A';

    // Breakdown by category group (bar chart)
    const byGroupResult = await pool.query(
      'SELECT category_group as group, COUNT(*) as count FROM nominations GROUP BY category_group ORDER BY count DESC'
    );
    const byGroup = byGroupResult.rows.map(r => ({ group: r.group, count: parseInt(r.count, 10) }));

    // Daily submissions over last 30 days (line chart)
    const dailyResult = await pool.query(
      `SELECT submitted_at::date as date, COUNT(*) as count
       FROM nominations
       WHERE submitted_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY submitted_at::date
       ORDER BY date`
    );
    const dailySubmissions = dailyResult.rows.map(r => ({
      date: r.date,
      count: parseInt(r.count, 10)
    }));

    // Top 10 categories by count
    const topCategoriesResult = await pool.query(
      `SELECT category, category_group as group, COUNT(*) as count
       FROM nominations
       GROUP BY category, category_group
       ORDER BY count DESC
       LIMIT 10`
    );
    const topCategories = topCategoriesResult.rows.map(r => ({
      category: r.category,
      group: r.group,
      count: parseInt(r.count, 10)
    }));

    res.json({
      success: true,
      totalNominations,
      categoriesCovered,
      todaySubmissions,
      topCategory,
      byGroup,
      dailySubmissions,
      topCategories
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/admin/export
router.get('/export', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM nominations ORDER BY submitted_at DESC');
    const nominations = result.rows;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LNUGS-UENR Excellence Awards';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Nominations');

    // Define columns with proper widths
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Category', key: 'category', width: 40 },
      { header: 'Category Group', key: 'category_group', width: 35 },
      { header: 'Bio', key: 'bio', width: 50 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Photo URL', key: 'photo_url', width: 40 },
      { header: 'Submitted At', key: 'submitted_at', width: 22 }
    ];

    // Style header row - red fill, white bold text
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC0111F' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 11
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    nominations.forEach((nom) => {
      worksheet.addRow({
        id: nom.id,
        full_name: nom.full_name,
        category: nom.category,
        category_group: nom.category_group,
        bio: nom.bio,
        mobile: nom.mobile,
        email: nom.email,
        photo_url: nom.photo_url || '',
        submitted_at: nom.submitted_at ? new Date(nom.submitted_at).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : ''
      });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=LNUGS_Nominations_Export.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exporting nominations:', err);
    res.status(500).json({ success: false, message: 'Export failed.' });
  }
});

// DELETE /api/admin/nominations/:id
router.delete('/nominations/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the nomination exists
    const result = await pool.query('DELETE FROM nominations WHERE id = $1 RETURNING id', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Nomination not found.' });
    }
    
    res.json({ success: true, message: 'Nomination deleted successfully.' });
  } catch (err) {
    console.error('Error deleting nomination:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
