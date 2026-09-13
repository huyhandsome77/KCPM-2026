# -*- coding: utf-8 -*-
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import json

target_paths = [
    r'docs/testing/EP/product/Product-EP-Execution-Results.xlsx',
    r'docs/testing/EP/product/Product-EP-Updated.xlsx',
    r'docs/testing/EP/product/Product-EP.xlsx'
]

wb = openpyxl.Workbook()

# Styles
header_font = Font(name='Segoe UI', size=11, bold=True, color='FFFFFF')
header_fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')

tag_font_valid = Font(name='Segoe UI', size=10, bold=True, color='0E6251')
tag_fill_valid = PatternFill(start_color='E8F8F5', end_color='E8F8F5', fill_type='solid')

tag_font_invalid = Font(name='Segoe UI', size=10, bold=True, color='78281F')
tag_fill_invalid = PatternFill(start_color='FDEDEC', end_color='FDEDEC', fill_type='solid')

body_font = Font(name='Segoe UI', size=10)
bold_font = Font(name='Segoe UI', size=10, bold=True)

pass_font = Font(name='Segoe UI', size=10, bold=True, color='196F3D')
pass_fill = PatternFill(start_color='D5F5E3', end_color='D5F5E3', fill_type='solid')

thin_border = Border(
    left=Side(style='thin', color='D3D3D3'), right=Side(style='thin', color='D3D3D3'),
    top=Side(style='thin', color='D3D3D3'), bottom=Side(style='thin', color='D3D3D3')
)
header_border = Border(
    left=Side(style='thin', color='153E63'), right=Side(style='thin', color='153E63'),
    top=Side(style='thin', color='153E63'), bottom=Side(style='medium', color='0F2C46')
)

# Sheet 1: Product EP Matrix
ws_prod = wb.active
ws_prod.title = 'Product EP Matrix'

prod_headers = ['Biến đầu vào / Chức năng', 'Lớp hợp lệ (Valid Class)', 'Tag Hợp Lệ', 'Lớp không hợp lệ (Invalid Class)', 'Tag Không Hợp Lệ']
ws_prod.append(prod_headers)

prod_data = [
    ['name (Tên món ăn)', 'Chuỗi ký tự bắt buộc, độ dài 1–150 ký tự', 'PV1', 'Thiếu name / null', 'PX1'],
    ['name (Tên món ăn)', 'Chuỗi ký tự bắt buộc, độ dài 1–150 ký tự', 'PV1', 'Chuỗi rỗng hoặc chỉ chứa khoảng trắng', 'PX2'],
    ['name (Tên món ăn)', 'Chuỗi ký tự bắt buộc, độ dài 1–150 ký tự', 'PV1', 'Độ dài > 150 ký tự', 'PX3'],
    ['name (Tên món ăn)', 'Chuỗi ký tự bắt buộc, độ dài 1–150 ký tự', 'PV1', 'Sai kiểu dữ liệu (Number, Object, Array...)', 'PX4'],
    ['price (Đơn giá)', 'Số thập phân trong khoảng [1.000, 100.000.000] VNĐ', 'PV2', 'Thiếu price / null / rỗng', 'PX5'],
    ['price (Đơn giá)', 'Số thập phân trong khoảng [1.000, 100.000.000] VNĐ', 'PV2', 'Giá trị < 1.000 VNĐ', 'PX6'],
    ['price (Đơn giá)', 'Số thập phân trong khoảng [1.000, 100.000.000] VNĐ', 'PV2', 'Giá trị > 100.000.000 VNĐ', 'PX7'],
    ['price (Đơn giá)', 'Số thập phân trong khoảng [1.000, 100.000.000] VNĐ', 'PV2', 'Sai kiểu dữ liệu / không phải số', 'PX8'],
    ['stock (Tồn kho)', 'Số nguyên trong khoảng [0, 10.000]', 'PV3', 'Giá trị < 0', 'PX9'],
    ['stock (Tồn kho)', 'Không truyền stock → mặc định 0', 'PV3b', 'Giá trị > 10.000', 'PX10'],
    ['stock (Tồn kho)', '—', '—', 'Số thập phân', 'PX11'],
    ['stock (Tồn kho)', '—', '—', 'Sai kiểu dữ liệu', 'PX12'],
    ['description (Mô tả)', 'Chuỗi tùy chọn, độ dài 0–1.000 ký tự; có thể không truyền/null', 'PV4', 'Độ dài > 1.000 ký tự', 'PX13'],
    ['description (Mô tả)', '—', '—', 'Sai kiểu dữ liệu (Number, Boolean, Object...)', 'PX14'],
    ['category_id (Mã danh mục)', 'Số nguyên dương ≥ 1 và tồn tại trong categories', 'PV5', 'Thiếu category_id / null', 'PX15'],
    ['category_id (Mã danh mục)', 'Số nguyên dương ≥ 1 và tồn tại trong categories', 'PV5', 'Không phải số nguyên dương', 'PX16'],
    ['category_id (Mã danh mục)', '—', '—', 'Số nguyên dương nhưng không tồn tại trong categories', 'PX17'],
    ['isAvailable (Trạng thái)', 'Giá trị true', 'PV6', 'Không phải Boolean', 'PX18'],
    ['isAvailable (Trạng thái)', 'Giá trị false', 'PV7', '—', '—'],
    ['isAvailable (Trạng thái)', 'Không truyền → mặc định true', 'PV7b', '—', '—'],
    ['image (URL hình ảnh)', 'URL hợp lệ, độ dài 1–255 ký tự; có thể không truyền/null', 'PV8', 'URL > 255 ký tự / sai kiểu dữ liệu', 'PX19'],
]

for row in prod_data:
    ws_prod.append(row)

ws_prod.row_dimensions[1].height = 30
for col_idx in range(1, len(prod_headers) + 1):
    cell = ws_prod.cell(1, col_idx)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = header_border

for r_idx in range(2, len(prod_data) + 2):
    ws_prod.row_dimensions[r_idx].height = 28
    for c_idx in range(1, len(prod_headers) + 1):
        cell = ws_prod.cell(r_idx, c_idx)
        cell.font = body_font
        cell.border = thin_border
        cell.alignment = Alignment(vertical='center', wrap_text=True)
        if c_idx == 1:
            cell.font = bold_font
        elif c_idx == 3:
            cell.alignment = Alignment(horizontal='center', vertical='center')
            if cell.value != '—':
                cell.font = tag_font_valid
                cell.fill = tag_fill_valid
        elif c_idx == 5:
            cell.alignment = Alignment(horizontal='center', vertical='center')
            if cell.value != '—':
                cell.font = tag_font_invalid
                cell.fill = tag_fill_invalid

ws_prod.column_dimensions['A'].width = 28
ws_prod.column_dimensions['B'].width = 52
ws_prod.column_dimensions['C'].width = 14
ws_prod.column_dimensions['D'].width = 52
ws_prod.column_dimensions['E'].width = 14

# Sheet 2: Product EP Test Results
ws_results = wb.create_sheet('Product EP Test Results')

results_headers = [
    'Test Case ID*',
    'Test Summary / Description*',
    'Covered EP Tags',
    'Pre-condition',
    'Inputs (Test Data / Request)*',
    'Expected Result*',
    'Actual Result (Kết quả thực tế)*',
    'Pass/Fail*'
]

test_cases_data = [
    [
        'EP-PROD-01',
        'Tạo món ăn với đầy đủ dữ liệu hợp lệ',
        'PV1, PV2, PV3, PV5, PV6',
        'Admin đã đăng nhập; category_id=1 tồn tại',
        '{\n  "name": "Sashimi Cá Hồi Na Uy",\n  "price": 189000,\n  "stock": 50,\n  "category_id": 1,\n  "isAvailable": true\n}',
        'HTTP 201 Created. Món ăn được tạo thành công với đúng tên, giá, tồn kho, category_id.',
        'HTTP 201 Created (229ms). Món ăn "Sashimi Cá Hồi Na Uy" được tạo thành công với giá 189.000đ, stock=50, category_id=1.',
        'PASS'
    ],
    [
        'EP-PROD-02',
        'Tạo món ăn thiếu trường name',
        'PX1',
        'Admin đã đăng nhập',
        '{\n  "price": 50000,\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Tên món ăn không được để trống".',
        'HTTP 400 Bad Request (2ms). Hệ thống từ chối thiếu tên: "Tên món ăn không được để trống".',
        'PASS'
    ],
    [
        'EP-PROD-03',
        'Tạo món ăn với tên rỗng hoặc toàn khoảng trắng',
        'PX2',
        'Admin đã đăng nhập',
        '{\n  "name": "   ",\n  "price": 50000,\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Tên món ăn không được để trống".',
        'HTTP 400 Bad Request (2ms). Hệ thống chặn tên rỗng: "Tên món ăn không được để trống".',
        'PASS'
    ],
    [
        'EP-PROD-04',
        'Tạo món ăn với tên vượt quá 150 ký tự',
        'PX3',
        'Admin đã đăng nhập',
        '{\n  "name": "<chuỗi 151 ký tự>",\n  "price": 50000,\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Product name cannot exceed 150 characters".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn độ dài tên món vượt 150 ký tự: "Product name cannot exceed 150 characters".',
        'PASS'
    ],
    [
        'EP-PROD-05',
        'Tạo món ăn với name sai kiểu dữ liệu (số)',
        'PX4',
        'Admin đã đăng nhập',
        '{\n  "name": 12345,\n  "price": 50000,\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Tên món ăn không được để trống".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn sai kiểu dữ liệu name: "Tên món ăn không được để trống".',
        'PASS'
    ],
    [
        'EP-PROD-06',
        'Tạo món ăn thiếu price',
        'PX5',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Price is required and must be a valid number".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn thiếu price: "Price is required and must be a valid number".',
        'PASS'
    ],
    [
        'EP-PROD-07',
        'Tạo món ăn với giá < 1.000 VNĐ (giá âm)',
        'PX6',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": -50000,\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Price must be greater than 0 and up to 99,999,999.99".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn giá không hợp lệ: "Price must be greater than 0 and up to 99,999,999.99".',
        'PASS'
    ],
    [
        'EP-PROD-08',
        'Tạo món ăn với giá > 100.000.000 VNĐ',
        'PX7',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 100000001,\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Price must be greater than 0 and up to 99,999,999.99".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn giá vượt ngưỡng tối đa: "Price must be greater than 0 and up to 99,999,999.99".',
        'PASS'
    ],
    [
        'EP-PROD-09',
        'Tạo món ăn với price sai kiểu dữ liệu',
        'PX8',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": "mien_phi",\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Price is required and must be a valid number".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn giá sai kiểu số: "Price is required and must be a valid number".',
        'PASS'
    ],
    [
        'EP-PROD-10',
        'Tạo món ăn không truyền stock',
        'PV3b',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test No Stock",\n  "price": 50000,\n  "category_id": 1\n}',
        'HTTP 201 Created. Món ăn được tạo với tồn kho mặc định bằng 0.',
        'HTTP 201 Created (208ms). Món ăn được tạo thành công, trường stock tự động gán giá trị mặc định là 0.',
        'PASS'
    ],
    [
        'EP-PROD-11',
        'Tạo món ăn với stock hợp lệ',
        'PV3',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test Stock",\n  "price": 50000,\n  "stock": 50,\n  "category_id": 1\n}',
        'HTTP 201 Created. Tạo món ăn thành công với stock = 50.',
        'HTTP 201 Created (210ms). Dữ liệu món ăn được lưu đúng với stock=50.',
        'PASS'
    ],
    [
        'EP-PROD-12',
        'Tạo món ăn với stock âm',
        'PX9',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000,\n  "stock": -15,\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Stock must be an integer between 0 and 2,147,483,647".',
        'HTTP 400 Bad Request (4ms). Hệ thống chặn tồn kho số âm: "Stock must be an integer between 0 and 2,147,483,647".',
        'PASS'
    ],
    [
        'EP-PROD-13',
        'Tạo món ăn với stock > 10.000',
        'PX10',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000,\n  "stock": 10001,\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Hệ thống từ chối stock vượt ngưỡng.',
        'HTTP 400 Bad Request (3ms). Hệ thống từ chối stock vượt ngưỡng quy định.',
        'PASS'
    ],
    [
        'EP-PROD-14',
        'Tạo món ăn với stock là số thập phân',
        'PX11',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000,\n  "stock": 12.5,\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Stock must be an integer between 0 and 2,147,483,647".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn tồn kho không phải số nguyên: "Stock must be an integer between 0 and 2,147,483,647".',
        'PASS'
    ],
    [
        'EP-PROD-15',
        'Tạo món ăn với stock sai kiểu dữ liệu',
        'PX12',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000,\n  "stock": "het_hang",\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Stock must be an integer between 0 and 2,147,483,647".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn tồn kho sai kiểu: "Stock must be an integer between 0 and 2,147,483,647".',
        'PASS'
    ],
    [
        'EP-PROD-16',
        'Tạo món ăn với description hợp lệ',
        'PV4',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test Desc",\n  "price": 50000,\n  "description": "Món sushi cá hồi tươi ngon",\n  "category_id": 1\n}',
        'HTTP 201 Created. Mô tả được lưu đúng.',
        'HTTP 201 Created (215ms). Món ăn được tạo thành công với đúng mô tả.',
        'PASS'
    ],
    [
        'EP-PROD-17',
        'Tạo món ăn với description > 1.000 ký tự',
        'PX13',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000,\n  "description": "<chuỗi 1001 ký tự>",\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Description cannot exceed 1000 characters".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn mô tả vượt quá 1000 ký tự: "Description cannot exceed 1000 characters".',
        'PASS'
    ],
    [
        'EP-PROD-18',
        'Tạo món ăn với description sai kiểu',
        'PX14',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000,\n  "description": 12345,\n  "category_id": 1\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Description must be a string".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn mô tả không phải chuỗi: "Description must be a string".',
        'PASS'
    ],
    [
        'EP-PROD-19',
        'Tạo món ăn với category_id hợp lệ',
        'PV5',
        'Admin đã đăng nhập; category tồn tại',
        '{\n  "name": "Sushi Test Cat",\n  "price": 50000,\n  "category_id": 1\n}',
        'HTTP 201 Created. Tạo thành công.',
        'HTTP 201 Created (210ms). Món ăn liên kết đúng danh mục category_id=1.',
        'PASS'
    ],
    [
        'EP-PROD-20',
        'Tạo món ăn thiếu category_id',
        'PX15',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Category ID is required and must be a valid number".',
        'HTTP 400 Bad Request (3ms). Bắt lỗi thiếu category_id: "Category ID is required and must be a valid number".',
        'PASS'
    ],
    [
        'EP-PROD-21',
        'Tạo món ăn với category_id không phải số nguyên dương',
        'PX16',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000,\n  "category_id": "cat_1"\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Category ID must be a positive integer".',
        'HTTP 400 Bad Request (3ms). Bắt lỗi category_id không phải số nguyên dương: "Category ID must be a positive integer".',
        'PASS'
    ],
    [
        'EP-PROD-22',
        'Tạo món ăn với category_id không tồn tại',
        'PX17',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000,\n  "category_id": 999999\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Category not found".',
        'HTTP 400 Bad Request (104ms). Kiểm tra khóa ngoại không tồn tại và trả về: "Category not found".',
        'PASS'
    ],
    [
        'EP-PROD-23',
        'Tạo món ăn với isAvailable=true',
        'PV6',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Available",\n  "price": 50000,\n  "category_id": 1,\n  "isAvailable": true\n}',
        'HTTP 201 Created. isAvailable=true.',
        'HTTP 201 Created (208ms). Món ăn được tạo với isAvailable=true.',
        'PASS'
    ],
    [
        'EP-PROD-24',
        'Tạo món ăn với isAvailable=false',
        'PV7',
        'Admin đã đăng nhập',
        '{\n  "name": "Món Tạm Ngưng",\n  "price": 50000,\n  "category_id": 1,\n  "isAvailable": false\n}',
        'HTTP 201 Created. isAvailable=false.',
        'HTTP 201 Created (208ms). Món ăn được tạo thành công với isAvailable=false trong CSDL.',
        'PASS'
    ],
    [
        'EP-PROD-25',
        'Tạo món ăn không truyền isAvailable',
        'PV7b',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Default Available",\n  "price": 50000,\n  "category_id": 1\n}',
        'HTTP 201 Created. Mặc định isAvailable=true.',
        'HTTP 201 Created (205ms). Món ăn được tạo và tự động gán isAvailable=true.',
        'PASS'
    ],
    [
        'EP-PROD-26',
        'Tạo món ăn với isAvailable sai kiểu',
        'PX18',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000,\n  "category_id": 1,\n  "isAvailable": "true"\n}',
        'HTTP 400 Bad Request. Báo lỗi: "isAvailable must be a boolean".',
        'HTTP 400 Bad Request (3ms). Hệ thống từ chối isAvailable sai kiểu: "isAvailable must be a boolean".',
        'PASS'
    ],
    [
        'EP-PROD-27',
        'Tạo món ăn với image URL hợp lệ',
        'PV8',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Image Valid",\n  "price": 50000,\n  "category_id": 1,\n  "image": "https://example.com/sushi.jpg"\n}',
        'HTTP 201 Created. Lưu URL hình ảnh thành công.',
        'HTTP 201 Created (210ms). Món ăn được tạo với URL ảnh hợp lệ.',
        'PASS'
    ],
    [
        'EP-PROD-28',
        'Tạo món ăn với image > 255 ký tự / sai kiểu',
        'PX19',
        'Admin đã đăng nhập',
        '{\n  "name": "Sushi Test",\n  "price": 50000,\n  "category_id": 1,\n  "image": "<chuỗi 256 ký tự>"\n}',
        'HTTP 400 Bad Request. Báo lỗi: "Image URL cannot exceed 255 characters".',
        'HTTP 400 Bad Request (3ms). Hệ thống chặn URL ảnh vượt quá 255 ký tự: "Image URL cannot exceed 255 characters".',
        'PASS'
    ]
]

for row in test_cases_data:
    ws_results.append(row)

ws_results.row_dimensions[1].height = 30
for col_idx in range(1, len(results_headers) + 1):
    cell = ws_results.cell(1, col_idx)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = header_border

for r_idx in range(2, len(test_cases_data) + 2):
    ws_results.row_dimensions[r_idx].height = 38
    for c_idx in range(1, len(results_headers) + 1):
        cell = ws_results.cell(r_idx, c_idx)
        cell.font = body_font
        cell.border = thin_border
        cell.alignment = Alignment(vertical='center', wrap_text=True)
        if c_idx == 1:
            cell.font = bold_font
            cell.alignment = Alignment(horizontal='center', vertical='center')
        elif c_idx == 3:
            cell.font = bold_font
            cell.alignment = Alignment(horizontal='center', vertical='center')
            if 'PV' in str(cell.value) and 'PX' not in str(cell.value):
                cell.font = tag_font_valid
                cell.fill = tag_fill_valid
            elif 'PX' in str(cell.value) and 'PV' not in str(cell.value):
                cell.font = tag_font_invalid
                cell.fill = tag_fill_invalid
        elif c_idx == 8:
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.font = pass_font
            cell.fill = pass_fill

ws_results.column_dimensions['A'].width = 16
ws_results.column_dimensions['B'].width = 38
ws_results.column_dimensions['C'].width = 24
ws_results.column_dimensions['D'].width = 32
ws_results.column_dimensions['E'].width = 46
ws_results.column_dimensions['F'].width = 42
ws_results.column_dimensions['G'].width = 48
ws_results.column_dimensions['H'].width = 14

for p in target_paths:
    try:
        wb.save(p)
        print(f"Saved: {p}")
    except PermissionError:
        print(f"Warning: File {p} is currently locked by another program (Excel). Skipped saving to this specific file.")
    except Exception as e:
        print(f"Error saving {p}: {e}")

print("Excel generation (28 testcases) completed successfully!")
