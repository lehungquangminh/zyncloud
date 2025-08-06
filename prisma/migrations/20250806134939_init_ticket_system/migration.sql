-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" TEXT,
    "password_reset_token" TEXT,
    "password_reset_expires" DATETIME,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER'
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "short_description" TEXT,
    "description" TEXT,
    "cpu_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "firewall_type" TEXT,
    "complimentary_gifts" JSONB,
    "base_price" DECIMAL NOT NULL,
    "first_time_discount_percent" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Package_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "billing_cycle" TEXT NOT NULL,
    "base_amount" DECIMAL NOT NULL,
    "discount_amount" DECIMAL DEFAULT 0,
    "coupon_code" TEXT,
    "final_amount" DECIMAL NOT NULL,
    "payment_method" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "admin_notes" TEXT,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "Package" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PterodactylUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "pterodactyl_user_id" INTEGER NOT NULL,
    "pterodactyl_username" TEXT NOT NULL,
    "pterodactyl_email" TEXT NOT NULL,
    "pterodactyl_password" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "PterodactylUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserServer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "pterodactyl_server_id" INTEGER NOT NULL,
    "server_name" TEXT NOT NULL,
    "server_ip" TEXT,
    "server_port" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "UserServer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserServer_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0.00,
    "total_topup" DECIMAL NOT NULL DEFAULT 0.00,
    "total_spent" DECIMAL NOT NULL DEFAULT 0.00,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "UserWallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "balance_before" DECIMAL NOT NULL,
    "balance_after" DECIMAL NOT NULL,
    "description" TEXT,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "admin_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TopupRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "requested_amount" DECIMAL NOT NULL,
    "actual_amount" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "card_telco" TEXT,
    "card_amount" DECIMAL,
    "card_serial" TEXT,
    "card_pin" TEXT,
    "exchange_rate" DECIMAL,
    "bank_account_name" TEXT,
    "bank_account_number" TEXT,
    "bank_name" TEXT,
    "transfer_code" TEXT,
    "processed_by" TEXT,
    "admin_notes" TEXT,
    "api_response" JSONB,
    "processed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "TopupRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topup_request_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "telco" TEXT NOT NULL,
    "card_amount" DECIMAL NOT NULL,
    "received_amount" DECIMAL NOT NULL,
    "exchange_rate" DECIMAL NOT NULL,
    "serial" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "api_provider" TEXT,
    "api_transaction_id" TEXT,
    "api_response" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CardTransaction_topup_request_id_fkey" FOREIGN KEY ("topup_request_id") REFERENCES "TopupRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CardTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telco" TEXT NOT NULL,
    "card_amount" DECIMAL NOT NULL,
    "exchange_rate" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentMethodConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method_type" TEXT NOT NULL,
    "method_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "configuration" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TicketCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticket_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assigned_admin_id" TEXT,
    "assigned_at" DATETIME,
    "first_response_at" DATETIME,
    "last_activity_at" DATETIME,
    "resolved_at" DATETIME,
    "closed_at" DATETIME,
    "tags" JSONB,
    "attachments_data" JSONB,
    "internal_notes" TEXT,
    "resolution_summary" TEXT,
    "sla_first_response_due" DATETIME,
    "sla_resolution_due" DATETIME,
    "sla_first_response_breached" BOOLEAN NOT NULL DEFAULT false,
    "sla_resolution_breached" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Ticket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "TicketCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_assigned_admin_id_fkey" FOREIGN KEY ("assigned_admin_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticket_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'MESSAGE',
    "is_admin_reply" BOOLEAN NOT NULL DEFAULT false,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "attachments_data" JSONB,
    "metadata" JSONB,
    "edited_at" DATETIME,
    "deleted_at" DATETIME,
    "read_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "TicketMessage_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TicketMessage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticket_id" TEXT,
    "message_id" TEXT,
    "user_id" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "stored_filename" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketAttachment_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TicketAttachment_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "TicketMessage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TicketAttachment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticket_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "admin_id" TEXT,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "response_time_rating" INTEGER,
    "solution_quality_rating" INTEGER,
    "admin_professionalism_rating" INTEGER,
    "would_recommend" BOOLEAN,
    "allow_public_display" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketRating_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketRating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketRating_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResponseTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admin_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category_id" TEXT,
    "tags" JSONB,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ResponseTemplate_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ResponseTemplate_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "TicketCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SLAPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority_level" TEXT NOT NULL,
    "first_response_time" INTEGER NOT NULL,
    "resolution_time" INTEGER NOT NULL,
    "escalation_time" INTEGER,
    "business_hours_only" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TicketEscalation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticket_id" TEXT NOT NULL,
    "escalated_from_id" TEXT,
    "escalated_to_id" TEXT NOT NULL,
    "escalation_reason" TEXT NOT NULL,
    "escalation_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketEscalation_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketEscalation_escalated_from_id_fkey" FOREIGN KEY ("escalated_from_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TicketEscalation_escalated_to_id_fkey" FOREIGN KEY ("escalated_to_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_number_key" ON "Order"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "PterodactylUser_user_id_key" ON "PterodactylUser"("user_id");

-- CreateIndex
CREATE INDEX "UserServer_user_id_idx" ON "UserServer"("user_id");

-- CreateIndex
CREATE INDEX "UserServer_expires_at_idx" ON "UserServer"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_user_id_key" ON "UserWallet"("user_id");

-- CreateIndex
CREATE INDEX "UserWallet_user_id_idx" ON "UserWallet"("user_id");

-- CreateIndex
CREATE INDEX "WalletTransaction_user_id_type_idx" ON "WalletTransaction"("user_id", "type");

-- CreateIndex
CREATE INDEX "WalletTransaction_reference_type_reference_id_idx" ON "WalletTransaction"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "WalletTransaction_created_at_idx" ON "WalletTransaction"("created_at");

-- CreateIndex
CREATE INDEX "TopupRequest_user_id_status_idx" ON "TopupRequest"("user_id", "status");

-- CreateIndex
CREATE INDEX "TopupRequest_method_status_idx" ON "TopupRequest"("method", "status");

-- CreateIndex
CREATE INDEX "TopupRequest_transfer_code_idx" ON "TopupRequest"("transfer_code");

-- CreateIndex
CREATE INDEX "CardTransaction_serial_pin_idx" ON "CardTransaction"("serial", "pin");

-- CreateIndex
CREATE INDEX "CardTransaction_status_idx" ON "CardTransaction"("status");

-- CreateIndex
CREATE INDEX "CardTransaction_api_transaction_id_idx" ON "CardTransaction"("api_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_telco_card_amount_key" ON "ExchangeRate"("telco", "card_amount");

-- CreateIndex
CREATE UNIQUE INDEX "TicketCategory_name_key" ON "TicketCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticket_number_key" ON "Ticket"("ticket_number");

-- CreateIndex
CREATE INDEX "Ticket_user_id_idx" ON "Ticket"("user_id");

-- CreateIndex
CREATE INDEX "Ticket_status_priority_idx" ON "Ticket"("status", "priority");

-- CreateIndex
CREATE INDEX "Ticket_assigned_admin_id_idx" ON "Ticket"("assigned_admin_id");

-- CreateIndex
CREATE INDEX "Ticket_category_id_status_idx" ON "Ticket"("category_id", "status");

-- CreateIndex
CREATE INDEX "Ticket_created_at_idx" ON "Ticket"("created_at");

-- CreateIndex
CREATE INDEX "Ticket_ticket_number_idx" ON "Ticket"("ticket_number");

-- CreateIndex
CREATE INDEX "TicketMessage_ticket_id_idx" ON "TicketMessage"("ticket_id");

-- CreateIndex
CREATE INDEX "TicketMessage_user_id_idx" ON "TicketMessage"("user_id");

-- CreateIndex
CREATE INDEX "TicketMessage_created_at_idx" ON "TicketMessage"("created_at");

-- CreateIndex
CREATE INDEX "TicketMessage_message_type_idx" ON "TicketMessage"("message_type");

-- CreateIndex
CREATE INDEX "TicketAttachment_ticket_id_idx" ON "TicketAttachment"("ticket_id");

-- CreateIndex
CREATE INDEX "TicketAttachment_message_id_idx" ON "TicketAttachment"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "TicketRating_ticket_id_key" ON "TicketRating"("ticket_id");

-- CreateIndex
CREATE INDEX "ResponseTemplate_admin_id_idx" ON "ResponseTemplate"("admin_id");

-- CreateIndex
CREATE INDEX "ResponseTemplate_category_id_idx" ON "ResponseTemplate"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "SLAPolicy_priority_level_key" ON "SLAPolicy"("priority_level");

-- CreateIndex
CREATE INDEX "TicketEscalation_ticket_id_idx" ON "TicketEscalation"("ticket_id");

-- CreateIndex
CREATE INDEX "TicketEscalation_escalated_to_id_idx" ON "TicketEscalation"("escalated_to_id");
