// prisma\seeds\ProductType.ts

const productTypes = [
  // Dress
  { name: "Dress", nameVi: "Đầm/Váy liền", parent: null },
  { name: "Casual Dress", nameVi: "Đầm thường ngày", parent: "Dress" },
  { name: "Cocktail Dress", nameVi: "Đầm dự tiệc", parent: "Dress" },

  // Top
  { name: "Top", nameVi: "Áo", parent: null },
  { name: "Short Sleeve T-Shirt", nameVi: "Áo thun ngắn tay", parent: "Top" },
  { name: "Tank Top", nameVi: "Áo ba lỗ", parent: "Top" },
  { name: "Cardigan", nameVi: "Áo cardigan", parent: "Top" },
  { name: "Pullover Sweater", nameVi: "Áo len chui đầu", parent: "Top" },
  { name: "Long Sleeve Blouse", nameVi: "Áo sơ mi tay dài", parent: "Top" },
  { name: "Sweatshirt", nameVi: "Áo sweatshirt", parent: "Top" },

  // Sweaters
  { name: "Sweaters", nameVi: "Áo len", parent: null },
  { name: "Turtleneck Sweater", nameVi: "Áo len cổ lọ", parent: "Sweaters" },

  // Coats & Jackets
  { name: "Coats & Jackets", nameVi: "Áo khoác", parent: null },
  { name: "Blazer", nameVi: "Áo blazer", parent: "Coats & Jackets" },
  { name: "Trenchcoat", nameVi: "Áo trench coat", parent: "Coats & Jackets" },
  { name: "Denim Jacket", nameVi: "Áo khoác jean", parent: "Coats & Jackets" },
  { name: "Leather Jacket", nameVi: "Áo khoác da", parent: "Coats & Jackets" },
  { name: "Wool Coat", nameVi: "Áo khoác len", parent: "Coats & Jackets" },

  // Jeans
  { name: "Jeans", nameVi: "Quần jeans", parent: null },

  // Pants
  { name: "Pants", nameVi: "Quần dài", parent: null },
  { name: "Wool Pants", nameVi: "Quần len", parent: "Pants" },
  { name: "Linen Pants", nameVi: "Quần linen", parent: "Pants" },
  { name: "Casual Pants", nameVi: "Quần thường ngày", parent: "Pants" },
  { name: "Dress Pants", nameVi: "Quần tây", parent: "Pants" },

  // Skirts
  { name: "Skirts", nameVi: "Chân váy", parent: null },
  { name: "Formal Skirt", nameVi: "Chân váy công sở", parent: "Skirts" },
  { name: "Casual Skirt", nameVi: "Chân váy thường ngày", parent: "Skirts" },

  // Shorts
  { name: "Shorts", nameVi: "Quần short", parent: null },
  { name: "Denim Shorts", nameVi: "Quần short jean", parent: "Shorts" },
  { name: "Khaki Shorts", nameVi: "Quần short kaki", parent: "Shorts" },
  { name: "Vintage Shorts", nameVi: "Quần short vintage", parent: "Shorts" },
  { name: "Romper", nameVi: "Áo liền quần ngắn", parent: "Shorts" },

  // Handbags
  { name: "Handbags", nameVi: "Túi xách", parent: null },
  { name: "Leather Tote", nameVi: "Túi tote da", parent: "Handbags" },
  { name: "Crossbody Bag", nameVi: "Túi đeo chéo", parent: "Handbags" },
  { name: "Shoulder Bag", nameVi: "Túi đeo vai", parent: "Handbags" },
  { name: "Leather Satchel", nameVi: "Túi satchel da", parent: "Handbags" },
  { name: "Leather Wristlet", nameVi: "Ví cầm tay da", parent: "Handbags" },
  { name: "Vintage Leather Wallet", nameVi: "Ví da vintage", parent: "Handbags" },

  // Shoes
  { name: "Shoes", nameVi: "Giày dép", parent: null },
  { name: "Sneakers", nameVi: "Giày thể thao", parent: "Shoes" },
  { name: "Heels", nameVi: "Giày cao gót", parent: "Shoes" },
  { name: "Wedges", nameVi: "Giày đế xuồng", parent: "Shoes" },
  { name: "Sandals", nameVi: "Sandal", parent: "Shoes" },
  { name: "Boots", nameVi: "Giày boot", parent: "Shoes" },
];

export default productTypes;
