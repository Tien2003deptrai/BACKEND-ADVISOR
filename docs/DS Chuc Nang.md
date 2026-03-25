**AI-ADVISOR**, được chia theo **4 lớp hệ thống: Frontend (FE), Backend
(BE), API, AI**.

**1. Bảng tổng hợp chức năng FE: hệ thống AI-ADVISOR**

| **Layer**    | **Module**         | **Chức năng cụ thể**     | **Mô tả**                              | **Người dùng** |
|--------------|--------------------|--------------------------|----------------------------------------|----------------|
| **Frontend** | Authentication UI  | Login / Logout           | Đăng nhập, đăng xuất hệ thống          | All            |
| **Frontend** | Profile Page       | View / Edit profile      | Xem và chỉnh sửa thông tin cá nhân     | All            |
| **Frontend** | Student Dashboard  | Risk Score Display       | Hiển thị Risk Score do AI dự đoán      | Student        |
| **Frontend** | Student Dashboard  | Academic Progress Chart  | Biểu đồ GPA và kết quả học tập         | Student        |
| **Frontend** | Student Dashboard  | Sentiment Trend          | Biểu đồ cảm xúc theo thời gian         | Student        |
| **Frontend** | Student Input Form | Submit academic data     | Sinh viên nhập GPA, stress, motivation | Student        |
| **Frontend** | Feedback Form      | Submit advising feedback | Gửi phản hồi sau buổi SHCVHT           | Student        |
| **Frontend** | Chatbot Interface  | Ask academic questions   | Giao diện hỏi đáp chatbot học vụ       | Student        |
| **Frontend** | Advisor Dashboard  | Student Risk Table       | Bảng danh sách SV và Risk Score        | Advisor        |
| **Frontend** | Advisor Dashboard  | Risk Alerts              | Hiển thị cảnh báo SV nguy cơ           | Advisor        |
| **Frontend** | Advisor Dashboard  | Sentiment Alerts         | Hiển thị phản hồi tiêu cực             | Advisor        |
| **Frontend** | Meeting Management | Upload meeting notes     | Nhập biên bản SHCVHT                   | Advisor        |
| **Frontend** | Meeting Management | View summarized notes    | Xem biên bản tóm tắt                   | Advisor        |
| **Frontend** | Faculty Dashboard  | Risk Distribution Chart  | Biểu đồ phân bố Risk Score             | Faculty        |
| **Frontend** | Faculty Dashboard  | KPI Monitoring           | Theo dõi KPI cố vấn học tập            | Faculty        |
| **Frontend** | Admin Panel        | Manage Users             | Quản lý tài khoản hệ thống             | Admin          |
| **Frontend** | Admin Panel        | System Configuration     | Cấu hình hệ thống                      | Admin          |

**2. Bảng tổng hợp chức năng BE: hệ thống AI-ADVISOR**

| **Layer**   | **Module**             | **Chức năng cụ thể**     | **Mô tả**                   | **Người dùng** |
|-------------|------------------------|--------------------------|-----------------------------|----------------|
| **Backend** | Authentication Service | Verify login credentials | Xác thực đăng nhập          | All            |
| **Backend** | Token Service          | Generate JWT token       | Tạo token xác thực          | All            |
| **Backend** | User Management        | Create / Update user     | Quản lý người dùng          | Admin          |
| **Backend** | Student Data Service   | Store academic records   | Lưu dữ liệu học tập         | System         |
| **Backend** | Feedback Service       | Store feedback data      | Lưu phản hồi SV             | System         |
| **Backend** | Meeting Notes Service  | Save advising notes      | Lưu biên bản SHCVHT         | Advisor        |
| **Backend** | Dashboard Service      | Aggregate statistics     | Tính toán dữ liệu dashboard | System         |
| **Backend** | Notification Service   | Send alerts              | Gửi cảnh báo cho CVHT       | System         |
| **Backend** | Recommendation Engine  | Generate suggestions     | Gợi ý cải thiện học tập     | Student        |

**3. DS API End Points cần phát triển**

| **Layer** | **API Endpoint**       | **Method** | **Mô tả**              |
|-----------|------------------------|------------|------------------------|
| **API**   | /api/auth/login        | POST       | Đăng nhập hệ thống     |
| **API**   | /api/auth/logout       | POST       | Đăng xuất              |
| **API**   | /api/users             | GET        | Lấy danh sách user     |
| **API**   | /api/students          | GET        | Lấy danh sách SV       |
| **API**   | /api/students/{id}     | GET        | Lấy thông tin SV       |
| **API**   | /api/academic/submit   | POST       | Lưu dữ liệu học tập    |
| **API**   | /api/feedback          | POST       | Gửi phản hồi           |
| **API**   | /api/feedback/list     | GET        | Lấy danh sách phản hồi |
| **API**   | /api/meeting           | POST       | Lưu biên bản SHCVHT    |
| **API**   | /api/dashboard/student | GET        | Dashboard sinh viên    |
| **API**   | /api/dashboard/advisor | GET        | Dashboard CVHT         |
| **API**   | /api/dashboard/faculty | GET        | Dashboard khoa         |
| **API**   | /api/chatbot/query     | POST       | Hỏi chatbot học vụ     |

# 4. DS AI Modules

| **Layer** | **AI Module**            | **Chức năng**                | **Input**                          | **Output**      | **Model**        |
|-----------|--------------------------|------------------------------|------------------------------------|-----------------|------------------|
| **AI**    | Academic Risk Prediction | Dự đoán nguy cơ học vụ       | GPA, attendance, stress, sentiment | Risk Score      | XGBoost          |
| **AI**    | Sentiment Analysis       | Phân tích cảm xúc phản hồi   | Feedback text                      | Sentiment label | PhoBERT          |
| **AI**    | Meeting Summarization    | Tóm tắt biên bản SHCVHT      | Meeting notes                      | Summary text    | T5               |
| **AI**    | Anomaly Detection        | Phát hiện học tập bất thường | Academic history                   | Anomaly alerts  | Isolation Forest |
| **AI**    | Academic Chatbot         | Chatbot học vụ               | Student question                   | AI response     | RAG + LLM        |

Sơ đồ BFD – Hệ thống AI-Advisor

<img src="media/image1.png" style="width:6.5in;height:3.1747in" />

**3. Product Backlog (Mapping từ chức năng)**

| **PBI ID** | **Feature / User Story**       | **Description**                                 | **User** | **Priority** |
|------------|--------------------------------|-------------------------------------------------|----------|--------------|
| PB01       | User login                     | User can login to the system                    | All      | High         |
| PB02       | User logout                    | User can logout from system                     | All      | High         |
| PB03       | Manage user profile            | View and edit profile information               | All      | Medium       |
| PB04       | Submit academic data           | Student enters GPA, stress, motivation          | Student  | High         |
| PB05       | Submit advising feedback       | Student sends feedback after advising session   | Student  | High         |
| PB06       | View student dashboard         | Student views risk score and progress charts    | Student  | High         |
| PB07       | Ask academic chatbot           | Student asks academic questions                 | Student  | Medium       |
| PB08       | Monitor students               | Advisor views list of students with risk scores | Advisor  | High         |
| PB09       | Receive risk alerts            | Advisor receives alerts for high-risk students  | Advisor  | High         |
| PB10       | View sentiment alerts          | Advisor sees negative sentiment feedback        | Advisor  | Medium       |
| PB11       | Upload meeting notes           | Advisor records advising session notes          | Advisor  | High         |
| PB12       | View summarized meeting notes  | Advisor views AI generated summary              | Advisor  | Medium       |
| PB13       | Faculty dashboard analytics    | Faculty monitors risk distribution and KPI      | Faculty  | Medium       |
| PB14       | Manage system users            | Admin manages user accounts                     | Admin    | Medium       |
| PB15       | Configure system settings      | Admin configures system parameters              | Admin    | Low          |
| PB16       | Risk prediction analysis       | System predicts academic risk                   | System   | High         |
| PB17       | Sentiment analysis processing  | System analyzes student feedback                | System   | High         |
| PB18       | Meeting summarization          | System summarizes advising notes                | System   | Medium       |
| PB19       | Anomaly detection              | System detects abnormal academic behavior       | System   | Medium       |
| PB20       | Academic chatbot service       | Chatbot answers academic questions              | System   | Medium       |
| PB21       | Dashboard analytics processing | Aggregate statistics for dashboards             | System   | High         |
| PB22       | Notification alerts            | System sends alerts to advisors                 | System   | Medium       |
| PB23       | Recommendation engine          | Suggest improvement actions to students         | System   | Medium       |

mapping chi tiết cho AI-ADVISOR

| **PBI** | **Frontend Feature**        | **Backend Service**    | **API Endpoint**       | **AI Module**            |
|---------|-----------------------------|------------------------|------------------------|--------------------------|
| PB01    | Login UI                    | Authentication Service | /api/auth/login        | —                        |
| PB02    | Logout button               | Token Service          | /api/auth/logout       | —                        |
| PB03    | Profile page                | User Management        | /api/users             | —                        |
| PB04    | Academic data form          | Student Data Service   | /api/academic/submit   | —                        |
| PB05    | Feedback form               | Feedback Service       | /api/feedback          | Sentiment Analysis       |
| PB06    | Student dashboard charts    | Dashboard Service      | /api/dashboard/student | Risk Prediction          |
| PB07    | Chatbot interface           | Chat service           | /api/chatbot/query     | Academic Chatbot         |
| PB08    | Student risk table          | Dashboard Service      | /api/dashboard/advisor | Risk Prediction          |
| PB09    | Risk alerts panel           | Notification Service   | /api/dashboard/advisor | Risk Prediction          |
| PB10    | Sentiment alerts panel      | Feedback Service       | /api/feedback/list     | Sentiment Analysis       |
| PB11    | Upload meeting notes UI     | Meeting Notes Service  | /api/meeting           | —                        |
| PB12    | View summarized notes UI    | Meeting Notes Service  | /api/meeting           | Meeting Summarization    |
| PB13    | Faculty analytics dashboard | Dashboard Service      | /api/dashboard/faculty | Risk Prediction          |
| PB14    | Admin user management       | User Management        | /api/users             | —                        |
| PB15    | Admin configuration panel   | System Config Service  | /api/config            | —                        |
| PB16    | Risk score calculation      | Analytics Engine       | internal service       | Academic Risk Prediction |
| PB17    | Feedback sentiment analysis | Feedback Service       | /api/feedback/list     | Sentiment Analysis       |
| PB18    | Meeting note summarization  | Meeting Service        | /api/meeting           | Meeting Summarization    |
| PB19    | Academic anomaly detection  | Analytics Engine       | internal service       | Anomaly Detection        |
| PB20    | Chatbot answering system    | Chatbot Service        | /api/chatbot/query     | Academic Chatbot         |
| PB21    | Dashboard statistics        | Dashboard Service      | /api/dashboard/\*      | Risk Prediction          |
| PB22    | Alert notification system   | Notification Service   | internal API           | Anomaly Detection        |
| PB23    | Recommendation system       | Recommendation Engine  | internal API           | Risk Prediction          |

Tóm tắt

| **Layer**       | **Modules**  |
|-----------------|--------------|
| Frontend        | 17 features  |
| Backend         | 9 services   |
| API             | 13 endpoints |
| AI              | 5 models     |
| Product Backlog | 23 PB        |

**Cấu trúc Epic tương ứng với PBI (cho Scrum)**

| **Epic**          | **PBI**   |
|-------------------|-----------|
| Authentication    | PB01–PB03 |
| Student Portal    | PB04–PB07 |
| Advisor Portal    | PB08–PB12 |
| Faculty Dashboard | PB13      |
| Admin Management  | PB14–PB15 |
| AI Analytics      | PB16–PB23 |

**Project Timeline**

| **Phase**          | **Description**|
|--------------------|---------------|
| Sprint 1           |Backend & APIs |
| Sprint 3           |Frontend UI    |


kế hoạch thực hiện dự án AI-ADVISOR
