import { supabase } from '@/lib/supabase';

export interface NewsletterCampaign {
    id: string;
    subject: string;
    previewText: string;
    content: string;
    htmlContent?: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    sentAt?: string;
    scheduledAt?: string;
    recipientCount: number;
    openedCount: number;
    clickedCount: number;
    unsubscribedCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CampaignTemplate {
    id: string;
    name: string;
    subject: string;
    content: string;
    previewText: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CampaignAnalytics {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalUnsubscribed: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    campaigns: NewsletterCampaign[];
}

class NewsletterCampaignService {
    // Campaigns
    async getCampaigns(): Promise<NewsletterCampaign[]> {
        const { data, error } = await supabase
            .from('newsletter_campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching campaigns:', error);
            return [];
        }

        return (data || []).map(this.mapCampaign);
    }

    async getCampaign(id: string): Promise<NewsletterCampaign | null> {
        const { data, error } = await supabase
            .from('newsletter_campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching campaign:', error);
            return null;
        }

        return this.mapCampaign(data);
    }

    async createCampaign(campaign: Omit<NewsletterCampaign, 'id' | 'createdAt' | 'updatedAt' | 'recipientCount' | 'openedCount' | 'clickedCount' | 'unsubscribedCount'>): Promise<NewsletterCampaign> {
        const { data, error } = await supabase
            .from('newsletter_campaigns')
            .insert([{
                subject: campaign.subject,
                preview_text: campaign.previewText,
                content: campaign.content,
                html_content: campaign.htmlContent,
                status: campaign.status,
                sent_at: campaign.sentAt,
                scheduled_at: campaign.scheduledAt,
                recipient_count: 0,
                opened_count: 0,
                clicked_count: 0,
                unsubscribed_count: 0
            }])
            .select()
            .single();

        if (error) throw error;
        return this.mapCampaign(data);
    }

    async updateCampaign(id: string, updates: Partial<NewsletterCampaign>): Promise<NewsletterCampaign> {
        const updateData: Record<string, unknown> = {};
        
        if (updates.subject) updateData.subject = updates.subject;
        if (updates.previewText) updateData.preview_text = updates.previewText;
        if (updates.content) updateData.content = updates.content;
        if (updates.htmlContent) updateData.html_content = updates.htmlContent;
        if (updates.status) updateData.status = updates.status;
        if (updates.sentAt) updateData.sent_at = updates.sentAt;
        if (updates.scheduledAt) updateData.scheduled_at = updates.scheduledAt;
        if (updates.recipientCount !== undefined) updateData.recipient_count = updates.recipientCount;
        if (updates.openedCount !== undefined) updateData.opened_count = updates.openedCount;
        if (updates.clickedCount !== undefined) updateData.clicked_count = updates.clickedCount;
        if (updates.unsubscribedCount !== undefined) updateData.unsubscribed_count = updates.unsubscribedCount;

        const { data, error } = await supabase
            .from('newsletter_campaigns')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapCampaign(data);
    }

    async deleteCampaign(id: string): Promise<void> {
        const { error } = await supabase
            .from('newsletter_campaigns')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async sendCampaign(id: string): Promise<void> {
        // Get campaign details
        const campaign = await this.getCampaign(id);
        if (!campaign) throw new Error('Campaign not found');

        // Update status to sending
        await this.updateCampaign(id, { status: 'sending' });

        try {
            // Get active subscribers
            const { data: subscribers, error: subError } = await supabase
                .from('newsletter_subscribers')
                .select('email, name')
                .eq('status', 'active');

            if (subError) throw subError;

            const recipientCount = subscribers?.length || 0;

            // Update recipient count
            await this.updateCampaign(id, { 
                recipientCount,
                status: 'sent',
                sentAt: new Date().toISOString()
            });

            // In a real implementation, you would:
            // 1. Use an email service like SendGrid, Mailchimp, or AWS SES
            // 2. Queue the emails for sending
            // 3. Track opens and clicks with tracking pixels
            // 4. Handle bounces and unsubscribes

            console.log(`Campaign ${id} sent to ${recipientCount} subscribers`);

        } catch (error) {
            await this.updateCampaign(id, { status: 'failed' });
            throw error;
        }
    }

    async scheduleCampaign(id: string, scheduledAt: string): Promise<void> {
        await this.updateCampaign(id, { 
            status: 'scheduled',
            scheduledAt 
        });
    }

    // Templates
    async getTemplates(): Promise<CampaignTemplate[]> {
        const { data, error } = await supabase
            .from('newsletter_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching templates:', error);
            return [];
        }

        return (data || []).map(this.mapTemplate);
    }

    async createTemplate(template: Omit<CampaignTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CampaignTemplate> {
        const { data, error } = await supabase
            .from('newsletter_templates')
            .insert([{
                name: template.name,
                subject: template.subject,
                content: template.content,
                preview_text: template.previewText,
                is_default: template.isDefault
            }])
            .select()
            .single();

        if (error) throw error;
        return this.mapTemplate(data);
    }

    async updateTemplate(id: string, updates: Partial<CampaignTemplate>): Promise<CampaignTemplate> {
        const updateData: Record<string, unknown> = {};
        
        if (updates.name) updateData.name = updates.name;
        if (updates.subject) updateData.subject = updates.subject;
        if (updates.content) updateData.content = updates.content;
        if (updates.previewText) updateData.preview_text = updates.previewText;
        if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;

        const { data, error } = await supabase
            .from('newsletter_templates')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapTemplate(data);
    }

    async deleteTemplate(id: string): Promise<void> {
        const { error } = await supabase
            .from('newsletter_templates')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // Analytics
    async getCampaignAnalytics(): Promise<CampaignAnalytics> {
        const campaigns = await this.getCampaigns();
        
        const totalSent = campaigns.reduce((sum, c) => sum + c.recipientCount, 0);
        const totalOpened = campaigns.reduce((sum, c) => sum + c.openedCount, 0);
        const totalClicked = campaigns.reduce((sum, c) => sum + c.clickedCount, 0);
        const totalUnsubscribed = campaigns.reduce((sum, c) => sum + c.unsubscribedCount, 0);

        return {
            totalSent,
            totalOpened,
            totalClicked,
            totalUnsubscribed,
            openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
            clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
            unsubscribeRate: totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0,
            campaigns
        };
    }

    // Preview
    async generatePreview(subject: string, content: string): Promise<string> {
        // Create a preview version of the newsletter
        // This would include tracking pixels and personalization in a real implementation
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: white; }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${subject}</h1>
                    </div>
                    <div class="content">
                        ${content}
                    </div>
                    <div class="footer">
                        <p>Você está recebendo este email porque se inscreveu na newsletter do Dra. Thalita Melo Advocacia.</p>
                        <p><a href="#">Cancelar inscrição</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Helper methods
    private mapCampaign(dbCampaign: unknown): NewsletterCampaign {
        const campaign = dbCampaign as Record<string, unknown>;
        return {
            id: campaign.id as string,
            subject: campaign.subject as string,
            previewText: campaign.preview_text as string,
            content: campaign.content as string,
            htmlContent: campaign.html_content as string,
            status: campaign.status as 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed',
            sentAt: campaign.sent_at as string,
            scheduledAt: campaign.scheduled_at as string,
            recipientCount: (campaign.recipient_count as number) || 0,
            openedCount: (campaign.opened_count as number) || 0,
            clickedCount: (campaign.clicked_count as number) || 0,
            unsubscribedCount: (campaign.unsubscribed_count as number) || 0,
            createdAt: campaign.created_at as string,
            updatedAt: campaign.updated_at as string
        };
    }

    private mapTemplate(dbTemplate: unknown): CampaignTemplate {
        const template = dbTemplate as Record<string, unknown>;
        return {
            id: template.id as string,
            name: template.name as string,
            subject: template.subject as string,
            content: template.content as string,
            previewText: template.preview_text as string,
            isDefault: template.is_default as boolean,
            createdAt: template.created_at as string,
            updatedAt: template.updated_at as string
        };
    }
}

export const newsletterCampaignService = new NewsletterCampaignService();
