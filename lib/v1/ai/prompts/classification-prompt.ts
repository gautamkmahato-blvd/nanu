export const EMAIL_CLASSIFICATION_TAXONOMY = ` 

CATEGORIES

[
"action_required",
"business",
"marketing",
"finance",
"shopping",
"travel",
"social",
"education",
"technology",
"personal",
"news",
"entertainment",
"health",
"government",
"other"
]

INDUSTRIES

[
"artificial_intelligence",
"saas",
"developer_tools",
"cloud_computing",
"cybersecurity",
"finance",
"banking",
"insurance",
"ecommerce",
"retail",
"food",
"restaurant",
"travel",
"hospitality",
"transportation",
"healthcare",
"fitness",
"education",
"real_estate",
"recruitment",
"consulting",
"legal",
"government",
"media",
"entertainment",
"telecommunications",
"manufacturing",
"nonprofit",
"productivity",
"other"
]

TOPIC_CLUSTERS

[
"sales_lead",
"partnership",
"proposal",
"negotiation",
"contract_review",
"account_management",
"customer_support",
"customer_success",
"renewal",
"vendor_management",

"approval_request",
"action_item",
"feedback_request",
"review_request",
"follow_up",
"meeting",
"scheduling",
"decision_required",

"invoice",
"payment",
"billing",
"subscription",
"refund",
"expense",
"payroll",
"investment",
"tax",

"job_application",
"interview",
"offer_letter",
"candidate_screening",
"recruiter_outreach",
"reference_check",

"product_update",
"feature_release",
"changelog",
"beta_program",
"account_notification",
"security_update",
"outage",
"maintenance",
"usage_report",

"ai_news",
"ai_research",
"ai_agents",
"llm_models",
"prompt_engineering",
"automation",

"github_activity",
"deployment",
"infrastructure",
"database",
"monitoring",
"api_updates",
"open_source",
"developer_productivity",

"promotion",
"discount_offer",
"email_marketing",
"content_marketing",
"advertising",
"event_invitation",
"webinar",
"product_announcement",

"order_confirmation",
"shipping_update",
"delivery_status",
"return_request",
"purchase_receipt",
"product_recommendation",

"flight_booking",
"hotel_booking",
"itinerary",
"travel_update",
"visa",

"course_update",
"assignment",
"exam",
"certificate",
"training",

"appointment",
"medical_report",
"prescription",
"insurance_claim",

"social_notification",
"community_update",
"networking",
"friend_request",

"industry_news",
"company_news",
"technology_news",
"finance_news",
"world_news",

"other"
]

CLASSIFICATION RULES

* category MUST come from CATEGORIES.
* industry MUST come from INDUSTRIES.
* topic_cluster MUST come from TOPIC_CLUSTERS.
* Never invent values.
* If uncertain, use "other".
* primary_tag should be the single most representative keyword/entity/concept.
* tags should contain 3-10 useful discovery keywords whenever possible.


TOPIC CLUSTER SELECTION RULES

* topic_cluster must be selected from ANY topic cluster group listed above.
* Choose EXACTLY ONE topic_cluster.
* Never invent new topic_cluster values.
* If multiple topic clusters seem applicable, choose the most specific one.
* If no topic cluster clearly fits, use "other".

CATEGORY TO TOPIC CLUSTER GUIDANCE

business commonly maps to:

* sales_lead
* partnership
* proposal
* negotiation
* contract_review
* account_management
* customer_support
* customer_success
* renewal
* vendor_management

finance commonly maps to:

* invoice
* payment
* billing
* subscription
* refund
* expense
* payroll
* investment
* tax

technology commonly maps to:

* github_activity
* deployment
* infrastructure
* database
* monitoring
* api_updates
* open_source
* developer_productivity
* product_update
* feature_release
* security_update

marketing commonly maps to:

* promotion
* discount_offer
* email_marketing
* content_marketing
* advertising
* webinar
* product_announcement
* event_invitation

shopping commonly maps to:

* order_confirmation
* shipping_update
* delivery_status
* purchase_receipt
* return_request

travel commonly maps to:

* flight_booking
* hotel_booking
* itinerary
* travel_update
* visa

education commonly maps to:

* course_update
* assignment
* exam
* certificate
* training

health commonly maps to:

* appointment
* medical_report
* prescription
* insurance_claim

social commonly maps to:

* social_notification
* community_update
* networking
* friend_request

news commonly maps to:

* industry_news
* company_news
* technology_news
* finance_news
* world_news

CLASSIFICATION CONSISTENCY RULES

category, industry, and topic_cluster should be logically consistent.

Good:

category: finance
industry: finance
topic_cluster: invoice

Good:

category: technology
industry: developer_tools
topic_cluster: deployment

Good:

category: marketing
industry: saas
topic_cluster: product_announcement

Bad:

category: finance
industry: restaurant
topic_cluster: github_activity

Bad:

category: travel
industry: healthcare
topic_cluster: database

NOTE: When multiple valid classifications exist, choose the combination that best represents the primary purpose of the email.



`;