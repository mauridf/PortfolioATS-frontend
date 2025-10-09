import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { ProfileService } from './profile.service';
import { ExperienceService } from './experience.service';
import { SkillService } from './skill.service';
import { EducationService } from './education.service';
import { CertificationService } from './certification.service';
import { LanguageService } from './language.service';
import { SocialLinkService } from './social-link.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(
    private profileService: ProfileService,
    private experienceService: ExperienceService,
    private skillService: SkillService,
    private educationService: EducationService,
    private certificationService: CertificationService,
    private languageService: LanguageService,
    private socialLinkService: SocialLinkService
  ) {}

  async generateATSCV(): Promise<void> {
    try {
      // Coletar todos os dados com valores padrão para evitar undefined
      const [
        profile,
        experiences,
        skills,
        educations,
        certifications,
        languages,
        socialLinks
      ] = await Promise.all([
        this.profileService.getProfile().toPromise().catch(() => null),
        this.experienceService.getAllExperiences().toPromise().catch(() => []),
        this.skillService.getAllSkills().toPromise().catch(() => []),
        this.educationService.getAllEducations().toPromise().catch(() => []),
        this.certificationService.getAllCertifications().toPromise().catch(() => []),
        this.languageService.getAllLanguages().toPromise().catch(() => []),
        this.socialLinkService.getAllSocialLinks().toPromise().catch(() => [])
      ]);

      this.createATSDocument(
        profile || {},
        experiences || [],
        skills || [],
        educations || [],
        certifications || [],
        languages || [],
        socialLinks || []
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  private createATSDocument(
    profile: any,
    experiences: any[],
    skills: any[],
    educations: any[],
    certifications: any[],
    languages: any[],
    socialLinks: any[]
  ): void {
    const doc = new jsPDF();
    
    // Configurações ATS-friendly
    const margin = 20;
    let yPosition = margin;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (2 * margin);

    // Header com informações de contato
    yPosition = this.addHeaderSection(doc, profile, socialLinks, margin, yPosition, contentWidth);

    // Resumo Profissional
    if (profile?.summary) {
      yPosition = this.addSectionTitle(doc, 'RESUMO PROFISSIONAL', yPosition);
      yPosition = this.addParagraph(doc, profile.summary, margin, yPosition, contentWidth, 12);
    }

    // Experiência Profissional
    if (experiences && experiences.length > 0) {
      yPosition = this.addSectionTitle(doc, 'EXPERIÊNCIA PROFISSIONAL', yPosition);
      // Ordenar experiências por data (mais recente primeiro)
      const sortedExperiences = [...experiences].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      sortedExperiences.forEach(exp => {
        yPosition = this.addExperience(doc, exp, margin, yPosition, contentWidth);
      });
    }

    // Habilidades Técnicas (organizadas por categoria para ATS)
    if (skills && skills.length > 0) {
      yPosition = this.addSectionTitle(doc, 'HABILIDADES TÉCNICAS', yPosition);
      yPosition = this.addSkillsByCategory(doc, skills, margin, yPosition, contentWidth);
    }

    // Formação Acadêmica
    if (educations && educations.length > 0) {
      yPosition = this.addSectionTitle(doc, 'FORMAÇÃO ACADÊMICA', yPosition);
      // Ordenar formações por data (mais recente primeiro)
      const sortedEducations = [...educations].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      sortedEducations.forEach(edu => {
        yPosition = this.addEducation(doc, edu, margin, yPosition, contentWidth);
      });
    }

    // Certificações
    if (certifications && certifications.length > 0) {
      yPosition = this.addSectionTitle(doc, 'CERTIFICAÇÕES', yPosition);
      certifications.forEach(cert => {
        yPosition = this.addCertification(doc, cert, margin, yPosition, contentWidth);
      });
    }

    // Idiomas
    if (languages && languages.length > 0) {
      yPosition = this.addSectionTitle(doc, 'IDIOMAS', yPosition);
      yPosition = this.addLanguages(doc, languages, margin, yPosition, contentWidth);
    }

    // Salvar o PDF
    doc.save('curriculo_ats.pdf');
  }

  private addHeaderSection(doc: jsPDF, profile: any, socialLinks: any[], margin: number, yPosition: number, contentWidth: number): number {
    // Nome em destaque
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(profile?.fullName || 'Nome do Candidato', margin, yPosition);
    yPosition += 10;

    // Informações de contato
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const contactInfo = [];
    if (profile?.email) contactInfo.push(profile.email);
    if (profile?.phone) contactInfo.push(profile.phone);
    if (profile?.location) contactInfo.push(profile.location);

    if (contactInfo.length > 0) {
      doc.text(contactInfo.join(' | '), margin, yPosition);
      yPosition += 6;
    }

    // Links sociais (apenas os principais para ATS)
    const mainSocialLinks = socialLinks?.filter(link => 
      ['LinkedIn', 'GitHub', 'Portfolio', 'Site Pessoal'].includes(link.platform)
    );

    if (mainSocialLinks && mainSocialLinks.length > 0) {
      const socialText = mainSocialLinks.map(link => `${link.platform}: ${link.url}`).join(' | ');
      doc.text(socialText, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 10;
    return yPosition;
  }

  private addSectionTitle(doc: jsPDF, title: string, yPosition: number): number {
    this.checkPageBreak(doc, yPosition);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(title, 20, yPosition);
    
    // Linha divisória
    doc.setDrawColor(0, 0, 0);
    doc.line(20, yPosition + 2, doc.internal.pageSize.width - 20, yPosition + 2);
    
    return yPosition + 10;
  }

  private addParagraph(doc: jsPDF, text: string, margin: number, yPosition: number, width: number, lineHeight: number): number {
    this.checkPageBreak(doc, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(text, width);
    doc.text(lines, margin, yPosition);
    
    return yPosition + (lines.length * lineHeight);
  }

  private addExperience(doc: jsPDF, experience: any, margin: number, yPosition: number, contentWidth: number): number {
    this.checkPageBreak(doc, yPosition + 20);

    // Cargo e Empresa
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(experience.position || 'Cargo não informado', margin, yPosition);
    
    // Empresa e localização
    doc.setFont('helvetica', 'normal');
    let companyText = experience.company || 'Empresa não informada';
    if (experience.location) companyText += ` | ${experience.location}`;
    
    const companyX = margin + 80;
    if (companyX + doc.getTextWidth(companyText) < doc.internal.pageSize.width - margin) {
      doc.text(companyText, companyX, yPosition);
    } else {
      yPosition += 5;
      doc.text(companyText, margin, yPosition);
    }
    
    yPosition += 5;

    // Período
    doc.setFontSize(9);
    const startDate = experience.startDate ? new Date(experience.startDate).toLocaleDateString('pt-BR') : 'Data não informada';
    const endDate = experience.currentJob ? 'Presente' : (experience.endDate ? new Date(experience.endDate).toLocaleDateString('pt-BR') : 'Data não informada');
    doc.text(`${startDate} - ${endDate}`, margin, yPosition);
    
    yPosition += 8;

    // Descrição
    if (experience.description) {
      doc.setFontSize(9);
      const descLines = doc.splitTextToSize(experience.description, contentWidth);
      doc.text(descLines, margin, yPosition);
      yPosition += (descLines.length * 4);
    }

    // Tecnologias/Habilidades (importante para ATS)
    if (experience.technologies && experience.technologies.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const techText = `Tecnologias: ${experience.technologies.join(', ')}`;
      const techLines = doc.splitTextToSize(techText, contentWidth);
      doc.text(techLines, margin, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += (techLines.length * 4);
    }

    yPosition += 10;
    return yPosition;
  }

  private addSkillsByCategory(doc: jsPDF, skills: any[], margin: number, yPosition: number, contentWidth: number): number {
    this.checkPageBreak(doc, yPosition + 30);

    // Agrupar habilidades por categoria
    const skillsByCategory = skills.reduce((acc: any, skill) => {
      const category = skill.category || 'Outras';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});

    Object.entries(skillsByCategory).forEach(([category, categorySkills]: [string, any]) => {
      this.checkPageBreak(doc, yPosition + 15);

      // Nome da categoria
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${category}:`, margin, yPosition);
      
      // Lista de habilidades
      const skillNames = categorySkills.map((skill: any) => skill.name);
      const skillsText = skillNames.join(', ');
      
      doc.setFont('helvetica', 'normal');
      const skillLines = doc.splitTextToSize(skillsText, contentWidth - 30);
      doc.text(skillLines, margin + 25, yPosition);
      
      yPosition += (skillLines.length * 4) + 5;
    });

    return yPosition + 5;
  }

  private addEducation(doc: jsPDF, education: any, margin: number, yPosition: number, contentWidth: number): number {
    this.checkPageBreak(doc, yPosition + 20);

    // Instituição e Curso
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(education.institution || 'Instituição não informada', margin, yPosition);
    
    doc.setFont('helvetica', 'normal');
    const fieldX = margin + 80;
    const fieldText = education.fieldOfStudy || 'Área não informada';
    if (fieldX + doc.getTextWidth(fieldText) < doc.internal.pageSize.width - margin) {
      doc.text(fieldText, fieldX, yPosition);
    } else {
      yPosition += 5;
      doc.text(fieldText, margin, yPosition);
    }
    
    yPosition += 5;

    // Grau e Período
    doc.setFontSize(9);
    const startYear = education.startDate ? new Date(education.startDate).getFullYear() : 'Ano não informado';
    const endYear = education.endDate ? new Date(education.endDate).getFullYear() : (education.isCompleted ? 'Ano não informado' : 'Presente');
    const degreeText = `${education.degree || 'Grau não informado'} | ${startYear} - ${endYear}`;
    
    doc.text(degreeText, margin, yPosition);
    
    yPosition += 8;

    // Descrição (se houver)
    if (education.description) {
      doc.setFontSize(9);
      const descLines = doc.splitTextToSize(education.description, contentWidth);
      doc.text(descLines, margin, yPosition);
      yPosition += (descLines.length * 4);
    }

    yPosition += 10;
    return yPosition;
  }

  private addCertification(doc: jsPDF, certification: any, margin: number, yPosition: number, contentWidth: number): number {
    this.checkPageBreak(doc, yPosition + 15);

    // Nome da certificação
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(certification.name || 'Certificação não informada', margin, yPosition);
    
    // Organização emissora
    doc.setFont('helvetica', 'normal');
    const orgX = margin + 80;
    const orgText = certification.issuingOrganization || 'Organização não informada';
    if (orgX + doc.getTextWidth(orgText) < doc.internal.pageSize.width - margin) {
      doc.text(orgText, orgX, yPosition);
    } else {
      yPosition += 5;
      doc.text(orgText, margin, yPosition);
    }
    
    yPosition += 5;

    // Datas
    doc.setFontSize(9);
    const issueDate = certification.issueDate ? new Date(certification.issueDate).toLocaleDateString('pt-BR') : 'Data não informada';
    let dateText = `Emitida em: ${issueDate}`;
    
    if (certification.expirationDate) {
      const expDate = new Date(certification.expirationDate).toLocaleDateString('pt-BR');
      dateText += ` | Válida até: ${expDate}`;
    } else {
      dateText += ' | Sem expiração';
    }
    
    doc.text(dateText, margin, yPosition);
    
    yPosition += 10;
    return yPosition;
  }

  private addLanguages(doc: jsPDF, languages: any[], margin: number, yPosition: number, contentWidth: number): number {
    this.checkPageBreak(doc, yPosition + 15);

    const languagesText = languages.map(lang => 
      `${lang.name || 'Idioma não informado'} - ${lang.proficiency || 'Nível não informado'}`
    ).join(' | ');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const langLines = doc.splitTextToSize(languagesText, contentWidth);
    doc.text(langLines, margin, yPosition);
    
    return yPosition + (langLines.length * 5) + 10;
  }

  private checkPageBreak(doc: jsPDF, yPosition: number): void {
    const pageHeight = doc.internal.pageSize.height;
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      // Não retorna nada, apenas adiciona página
    }
  }
}