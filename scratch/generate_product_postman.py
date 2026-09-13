# -*- coding: utf-8 -*-
import json

collection = {
    "info": {
        "_postman_id": "ep-product-suite-2026-v28",
        "name": "FutureSushi - EP Product API Test Suite",
        "description": "Bộ kiểm thử tự động Phân hoạch Lớp Tương đương (Equivalence Partitioning - EP) cho các trường đầu vào Create Product (/api/products) theo chuẩn hóa 28 Test Cases.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "event": [
        {
            "listen": "prerequest",
            "script": {
                "type": "text/javascript",
                "exec": [
                    "pm.collectionVariables.set('prd_name_151', 'P'.repeat(151));",
                    "pm.collectionVariables.set('desc_1001', 'D'.repeat(1001));",
                    "pm.collectionVariables.set('img_256', 'https://example.com/' + 'i'.repeat(240));"
                ]
            }
        },
        {
            "listen": "test",
            "script": {
                "type": "text/javascript",
                "exec": [
                    "pm.test('[Non-Functional] Response time is acceptable (< 1500ms)', function () {",
                    "    pm.expect(pm.response.responseTime).to.be.below(1500);",
                    "});"
                ]
            }
        }
    ],
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://localhost:3000",
            "type": "string"
        },
        {
            "key": "admin_token",
            "value": "",
            "type": "string"
        },
        {
            "key": "prd_name_151",
            "value": "",
            "type": "string"
        },
        {
            "key": "desc_1001",
            "value": "",
            "type": "string"
        },
        {
            "key": "img_256",
            "value": "",
            "type": "string"
        },
        {
            "key": "created_prod_id",
            "value": "1",
            "type": "string"
        }
    ],
    "item": []
}

# 0. Auth
auth_item = {
    "name": "0. Authentication",
    "item": [
        {
            "name": "AUTH_001 - Đăng nhập tài khoản Admin",
            "event": [
                {
                    "listen": "test",
                    "script": {
                        "type": "text/javascript",
                        "exec": [
                            "pm.test('Status code is 200 OK', function () {",
                            "    pm.response.to.have.status(200);",
                            "});",
                            "const json = pm.response.json();",
                            "pm.test('Đăng nhập thành công và trả về admin token', function () {",
                            "    pm.expect(json).to.have.property('token');",
                            "    pm.expect(json.token).to.be.a('string').and.not.empty;",
                            "});",
                            "if (json.token) {",
                            "    pm.collectionVariables.set('admin_token', json.token);",
                            "}"
                        ]
                    }
                }
            ],
            "request": {
                "method": "POST",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {
                    "mode": "raw",
                    "raw": "{\n  \"account\": \"admin\",\n  \"password\": \"123\"\n}"
                },
                "url": {
                    "raw": "{{baseUrl}}/api/auth/login",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "auth", "login"]
                }
            }
        }
    ]
}

collection["item"].append(auth_item)

# 1. CREATE PRODUCT EP TESTS (EP-PROD-01 to EP-PROD-28)
create_folder = {
    "name": "1. Product Input Fields EP (EP-PROD-01 -> EP-PROD-28)",
    "item": []
}

def make_create_test(tc_id, title, tag, body_dict, expected_status, test_assertions):
    return {
        "name": f"{tc_id} - {title} [{tag}]",
        "event": [
            {
                "listen": "test",
                "script": {
                    "type": "text/javascript",
                    "exec": [
                        f"pm.test('Status code is {expected_status}', function () {{",
                        f"    pm.response.to.have.status({expected_status});",
                        "});",
                        "const json = pm.response.json();"
                    ] + test_assertions
                }
            }
        ],
        "request": {
            "method": "POST",
            "header": [
                {"key": "Content-Type", "value": "application/json"},
                {"key": "Authorization", "value": "Bearer {{admin_token}}"}
            ],
            "body": {
                "mode": "raw",
                "raw": json.dumps(body_dict, indent=2, ensure_ascii=False) if isinstance(body_dict, dict) else body_dict
            },
            "url": {
                "raw": "{{baseUrl}}/api/products",
                "host": ["{{baseUrl}}"],
                "path": ["api", "products"]
            }
        }
    }

# EP-PROD-01
create_folder["item"].append(make_create_test(
    "EP-PROD-01", "Tạo món ăn với đầy đủ dữ liệu hợp lệ", "PV1, PV2, PV3, PV5, PV6",
    {"name": "Sashimi Cá Hồi Na Uy", "price": 189000, "stock": 50, "category_id": 1, "isAvailable": True},
    201,
    [
        "pm.test('Dữ liệu món ăn trả về chính xác', function () {",
        "    pm.expect(json.name).to.eql('Sashimi Cá Hồi Na Uy');",
        "    pm.expect(Number(json.price)).to.eql(189000);",
        "    pm.expect(json.stock).to.eql(50);",
        "    pm.expect(Boolean(json.isAvailable)).to.eql(true);",
        "    pm.expect(Number(json.category_id)).to.eql(1);",
        "});",
        "if (json.id) { pm.collectionVariables.set('created_prod_id', json.id.toString()); }"
    ]
))

# EP-PROD-02
create_folder["item"].append(make_create_test(
    "EP-PROD-02", "Tạo món ăn thiếu trường name", "PX1",
    {"price": 50000, "category_id": 1},
    400,
    ["pm.test('Báo lỗi tên không được để trống', function () { pm.expect(json.message).to.be.a('string').and.not.empty; });"]
))

# EP-PROD-03
create_folder["item"].append(make_create_test(
    "EP-PROD-03", "Tạo món ăn với tên rỗng hoặc toàn khoảng trắng", "PX2",
    {"name": "   ", "price": 50000, "category_id": 1},
    400,
    ["pm.test('Báo lỗi tên món rỗng', function () { pm.expect(json.message).to.include('Tên món ăn không được để trống'); });"]
))

# EP-PROD-04
create_folder["item"].append({
    "name": "EP-PROD-04 - Tạo món ăn với tên vượt quá 150 ký tự [PX3]",
    "event": [{
        "listen": "test",
        "script": {
            "type": "text/javascript",
            "exec": [
                "pm.test('Status code is 400 Bad Request', function () { pm.response.to.have.status(400); });",
                "const json = pm.response.json();",
                "pm.test('Báo lỗi tên vượt quá 150 ký tự', function () { pm.expect(json.message).to.include('Product name cannot exceed 150 characters'); });"
            ]
        }
    }],
    "request": {
        "method": "POST",
        "header": [
            {"key": "Content-Type", "value": "application/json"},
            {"key": "Authorization", "value": "Bearer {{admin_token}}"}
        ],
        "body": {
            "mode": "raw",
            "raw": "{\n  \"name\": \"{{prd_name_151}}\",\n  \"price\": 50000,\n  \"category_id\": 1\n}"
        },
        "url": {"raw": "{{baseUrl}}/api/products", "host": ["{{baseUrl}}"], "path": ["api", "products"]}
    }
})

# EP-PROD-05
create_folder["item"].append(make_create_test(
    "EP-PROD-05", "Tạo món ăn với name sai kiểu dữ liệu (số)", "PX4",
    {"name": 12345, "price": 50000, "category_id": 1},
    400,
    ["pm.test('Báo lỗi name sai kiểu dữ liệu', function () { pm.expect(json.message).to.be.a('string'); });"]
))

# EP-PROD-06
create_folder["item"].append(make_create_test(
    "EP-PROD-06", "Tạo món ăn thiếu price", "PX5",
    {"name": "Sushi Test", "category_id": 1},
    400,
    ["pm.test('Báo lỗi price bắt buộc', function () { pm.expect(json.message).to.include('Price is required and must be a valid number'); });"]
))

# EP-PROD-07
create_folder["item"].append(make_create_test(
    "EP-PROD-07", "Tạo món ăn với giá < 1.000 VNĐ (giá âm)", "PX6",
    {"name": "Sushi Test", "price": -50000, "category_id": 1},
    400,
    ["pm.test('Báo lỗi giá không hợp lệ', function () { pm.expect(json.message).to.include('Price must be greater than 0 and up to 99,999,999.99'); });"]
))

# EP-PROD-08
create_folder["item"].append(make_create_test(
    "EP-PROD-08", "Tạo món ăn với giá > 100.000.000 VNĐ", "PX7",
    {"name": "Sushi Test", "price": 100000001, "category_id": 1},
    400,
    ["pm.test('Báo lỗi giá vượt ngưỡng tối đa', function () { pm.expect(json.message).to.include('Price must be greater than 0 and up to 99,999,999.99'); });"]
))

# EP-PROD-09
create_folder["item"].append(make_create_test(
    "EP-PROD-09", "Tạo món ăn với price sai kiểu dữ liệu", "PX8",
    {"name": "Sushi Test", "price": "mien_phi", "category_id": 1},
    400,
    ["pm.test('Báo lỗi price không phải số', function () { pm.expect(json.message).to.include('Price is required and must be a valid number'); });"]
))

# EP-PROD-10
create_folder["item"].append(make_create_test(
    "EP-PROD-10", "Tạo món ăn không truyền stock (mặc định nhận 0)", "PV3b",
    {"name": "Sushi Test No Stock", "price": 50000, "category_id": 1},
    201,
    ["pm.test('Stock mặc định bằng 0', function () { pm.expect(json.stock).to.eql(0); });"]
))

# EP-PROD-11
create_folder["item"].append(make_create_test(
    "EP-PROD-11", "Tạo món ăn với stock hợp lệ", "PV3",
    {"name": "Sushi Test Stock", "price": 50000, "stock": 50, "category_id": 1},
    201,
    ["pm.test('Stock được lưu đúng bằng 50', function () { pm.expect(json.stock).to.eql(50); });"]
))

# EP-PROD-12
create_folder["item"].append(make_create_test(
    "EP-PROD-12", "Tạo món ăn với stock âm", "PX9",
    {"name": "Sushi Test", "price": 50000, "stock": -15, "category_id": 1},
    400,
    ["pm.test('Báo lỗi stock âm', function () { pm.expect(json.message).to.include('Stock must be an integer between 0 and 2,147,483,647'); });"]
))

# EP-PROD-13
create_folder["item"].append(make_create_test(
    "EP-PROD-13", "Tạo món ăn với stock > 10.000 / tràn số", "PX10",
    {"name": "Sushi Test", "price": 50000, "stock": 2147483648, "category_id": 1},
    400,
    ["pm.test('Báo lỗi stock vượt ngưỡng', function () { pm.expect(json.message).to.include('Stock must be an integer between 0 and 2,147,483,647'); });"]
))

# EP-PROD-14
create_folder["item"].append(make_create_test(
    "EP-PROD-14", "Tạo món ăn với stock là số thập phân", "PX11",
    {"name": "Sushi Test", "price": 50000, "stock": 12.5, "category_id": 1},
    400,
    ["pm.test('Báo lỗi stock là số thập phân', function () { pm.expect(json.message).to.include('Stock must be an integer between 0 and 2,147,483,647'); });"]
))

# EP-PROD-15
create_folder["item"].append(make_create_test(
    "EP-PROD-15", "Tạo món ăn với stock sai kiểu dữ liệu", "PX12",
    {"name": "Sushi Test", "price": 50000, "stock": "het_hang", "category_id": 1},
    400,
    ["pm.test('Báo lỗi stock sai kiểu dữ liệu', function () { pm.expect(json.message).to.include('Stock must be an integer between 0 and 2,147,483,647'); });"]
))

# EP-PROD-16
create_folder["item"].append(make_create_test(
    "EP-PROD-16", "Tạo món ăn với description hợp lệ", "PV4",
    {"name": "Sushi Test Desc", "price": 50000, "description": "Món sushi cá hồi tươi ngon", "category_id": 1},
    201,
    ["pm.test('Description được lưu đúng', function () { pm.expect(json.description).to.eql('Món sushi cá hồi tươi ngon'); });"]
))

# EP-PROD-17
create_folder["item"].append({
    "name": "EP-PROD-17 - Tạo món ăn với description > 1.000 ký tự [PX13]",
    "event": [{
        "listen": "test",
        "script": {
            "type": "text/javascript",
            "exec": [
                "pm.test('Status code is 400 Bad Request', function () { pm.response.to.have.status(400); });",
                "const json = pm.response.json();",
                "pm.test('Báo lỗi description vượt quá 1000 ký tự', function () { pm.expect(json.message).to.include('Description cannot exceed 1000 characters'); });"
            ]
        }
    }],
    "request": {
        "method": "POST",
        "header": [
            {"key": "Content-Type", "value": "application/json"},
            {"key": "Authorization", "value": "Bearer {{admin_token}}"}
        ],
        "body": {
            "mode": "raw",
            "raw": "{\n  \"name\": \"Sushi Test Desc Over\",\n  \"price\": 50000,\n  \"description\": \"{{desc_1001}}\",\n  \"category_id\": 1\n}"
        },
        "url": {"raw": "{{baseUrl}}/api/products", "host": ["{{baseUrl}}"], "path": ["api", "products"]}
    }
})

# EP-PROD-18
create_folder["item"].append(make_create_test(
    "EP-PROD-18", "Tạo món ăn với description sai kiểu", "PX14",
    {"name": "Sushi Test", "price": 50000, "description": 12345, "category_id": 1},
    400,
    ["pm.test('Báo lỗi description sai kiểu dữ liệu', function () { pm.expect(json.message).to.include('Description must be a string'); });"]
))

# EP-PROD-19
create_folder["item"].append(make_create_test(
    "EP-PROD-19", "Tạo món ăn với category_id hợp lệ", "PV5",
    {"name": "Sushi Test Cat", "price": 50000, "category_id": 1},
    201,
    ["pm.test('Món ăn gán đúng category_id=1', function () { pm.expect(Number(json.category_id)).to.eql(1); });"]
))

# EP-PROD-20
create_folder["item"].append(make_create_test(
    "EP-PROD-20", "Tạo món ăn thiếu category_id", "PX15",
    {"name": "Sushi Test", "price": 50000},
    400,
    ["pm.test('Báo lỗi thiếu category_id', function () { pm.expect(json.message).to.include('Category ID is required and must be a valid number'); });"]
))

# EP-PROD-21
create_folder["item"].append(make_create_test(
    "EP-PROD-21", "Tạo món ăn với category_id không phải số nguyên dương", "PX16",
    {"name": "Sushi Test", "price": 50000, "category_id": "cat_1"},
    400,
    ["pm.test('Báo lỗi category_id không phải số nguyên dương', function () { pm.expect(json.message).to.match(/Category ID/i); });"]
))

# EP-PROD-22
create_folder["item"].append(make_create_test(
    "EP-PROD-22", "Tạo món ăn với category_id không tồn tại trong DB", "PX17",
    {"name": "Sushi Test", "price": 50000, "category_id": 999999},
    400,
    ["pm.test('Báo lỗi Category not found', function () { pm.expect(json.message).to.include('Category not found'); });"]
))

# EP-PROD-23
create_folder["item"].append(make_create_test(
    "EP-PROD-23", "Tạo món ăn với isAvailable=true", "PV6",
    {"name": "Sushi Available", "price": 50000, "category_id": 1, "isAvailable": True},
    201,
    ["pm.test('isAvailable lưu đúng true', function () { pm.expect(json.isAvailable).to.eql(true); });"]
))

# EP-PROD-24
create_folder["item"].append(make_create_test(
    "EP-PROD-24", "Tạo món ăn với isAvailable=false", "PV7",
    {"name": "Món Tạm Ngưng", "price": 50000, "category_id": 1, "isAvailable": False},
    201,
    ["pm.test('isAvailable lưu đúng false', function () { pm.expect(json.isAvailable).to.eql(false); });"]
))

# EP-PROD-25
create_folder["item"].append(make_create_test(
    "EP-PROD-25", "Tạo món ăn không truyền isAvailable (mặc định true)", "PV7b",
    {"name": "Sushi Default Available", "price": 50000, "category_id": 1},
    201,
    ["pm.test('Mặc định isAvailable=true', function () { pm.expect(json.isAvailable).to.eql(true); });"]
))

# EP-PROD-26
create_folder["item"].append(make_create_test(
    "EP-PROD-26", "Tạo món ăn với isAvailable sai kiểu", "PX18",
    {"name": "Sushi Test", "price": 50000, "category_id": 1, "isAvailable": "true"},
    400,
    ["pm.test('Báo lỗi isAvailable phải là boolean', function () { pm.expect(json.message).to.include('isAvailable must be a boolean'); });"]
))

# EP-PROD-27
create_folder["item"].append(make_create_test(
    "EP-PROD-27", "Tạo món ăn với image URL hợp lệ", "PV8",
    {"name": "Sushi Image Valid", "price": 50000, "category_id": 1, "image": "https://example.com/sushi.jpg"},
    201,
    ["pm.test('Image URL được lưu chính xác', function () { pm.expect(json.image).to.eql('https://example.com/sushi.jpg'); });"]
))

# EP-PROD-28
create_folder["item"].append({
    "name": "EP-PROD-28 - Tạo món ăn với image > 255 ký tự / sai kiểu [PX19]",
    "event": [{
        "listen": "test",
        "script": {
            "type": "text/javascript",
            "exec": [
                "pm.test('Status code is 400 Bad Request', function () { pm.response.to.have.status(400); });",
                "const json = pm.response.json();",
                "pm.test('Báo lỗi Image URL vượt quá 255 ký tự', function () { pm.expect(json.message).to.include('Image URL cannot exceed 255 characters'); });"
            ]
        }
    }],
    "request": {
        "method": "POST",
        "header": [
            {"key": "Content-Type", "value": "application/json"},
            {"key": "Authorization", "value": "Bearer {{admin_token}}"}
        ],
        "body": {
            "mode": "raw",
            "raw": "{\n  \"name\": \"Sushi Test Img Over\",\n  \"price\": 50000,\n  \"category_id\": 1,\n  \"image\": \"{{img_256}}\"\n}"
        },
        "url": {"raw": "{{baseUrl}}/api/products", "host": ["{{baseUrl}}"], "path": ["api", "products"]}
    }
})

collection["item"].append(create_folder)

with open('docs/testing/EP/product/Product_EP_Postman_Collection.json', 'w', encoding='utf-8') as f:
    json.dump(collection, f, indent=4, ensure_ascii=False)

print("Product EP Postman Collection (28 testcases) generated successfully!")
